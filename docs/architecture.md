# ink-hud Architecture

## Overview

ink-hud renders interactive terminal dashboard widgets using [ink](https://github.com/vadimdemedes/ink) (React for CLIs). The library contains **two independent rendering systems** that operate in parallel: a character renderer chain for line/area/bar/pie charts, and an image protocol pipeline for bitmap-capable components (Heatmap, Sparkline). The two systems share no code and make independent terminal capability decisions.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ink-hud Components                          │
│                                                                     │
│  LineChart  AreaChart  BarChart  PieChart  │  Heatmap   Sparkline   │
│                                            │                        │
│      ↓ rendererChain prop                  │    ↓ mode prop         │
│  ┌─────────────────────────┐               │  ┌─────────────────┐   │
│  │  System 1: Character    │               │  │  System 2:      │   │
│  │  Renderer Chain         │               │  │  Image Protocol │   │
│  └─────────────────────────┘               │  └─────────────────┘   │
└────────────────────────────────────────────┼────────────────────────┘
                                             │
            Rendered via ink React tree      │  Rendered via stdout
            (pure ANSI text output)          │  escape sequences +
                                             │  ink placeholder chars
```

---

## System 1: Character Renderer Chain

Used by `LineChart`, `AreaChart`, `BarChart`, `PieChart`, and `Sparkline` (character mode).

### Data Flow

```
Component props
    ↓
useChartRenderer(props, rendererChain)
    ↓
InkHudContext.selectBest(chain)   ← provided by <InkHudProvider>
    ↓
RendererSelector.selectBest()
    ↓
TerminalDetector.detect()  →  TerminalCapabilities { score: 0-100, ... }
    ↓
Walk preferredChain, pick first renderer whose minScore ≤ score
    ↓
renderer: BrailleRenderer | BlockRenderer | AsciiRenderer
    ↓
renderer.createCanvas(pixelW, pixelH)   →   Pixel[][]
    ↓
draw onto canvas  (drawLine / setPixel / drawArc …)
    ↓
renderer.renderCanvas(canvas, w, h)   →   RenderedLine[]
    ↓
<Box> + <Text> via ink React tree
```

### Terminal Scoring (`src/detect/terminal.ts`)

`TerminalDetector` reads `LANG`, `TERM`, `COLORTERM`, `TERM_PROGRAM` and produces a 0–100 score:

| Feature | Points |
|---|---|
| UTF-8 (`LANG` contains `UTF-8`) | +20 |
| Unicode (same as UTF-8) | +10 |
| Braille (TERM_PROGRAM in whitelist) | +30 |
| Block Elements (same as Unicode) | +10 |
| Color (`TERM` has `color`/`256color` or `COLORTERM` set) | +15 |
| True color (`COLORTERM=truecolor` or `24bit`) | +15 |

Braille whitelist: `iterm`, `warp`, `alacritty`, `kitty`, `wezterm`, `hyper`, `tabby`, `rio`.

### Renderer Properties

| Renderer | minScore | Resolution (H×V px/char) | UTF-8 | Unicode |
|---|---|---|---|---|
| BrailleRenderer | 80 | 2×4 | ✓ | ✓ |
| BlockRenderer | 30 | 2×8 | ✓ | ✓ |
| AsciiRenderer | 0 | 1×1 | ✗ | ✗ |

### Renderer Chain Configuration

Each chart component has a default chain. Charts accept a `rendererChain` prop to override:

```tsx
// Default for LineChart / AreaChart: ['braille', 'block', 'ascii']
<LineChart rendererChain={['block', 'ascii']} ... />

// Force ascii globally via InkHudProvider
<InkHudProvider forceRenderer="ascii">
  <Dashboard />
</InkHudProvider>
```

### InkHudProvider

`<InkHudProvider>` wraps the app to provide `InkHudContext`. Without it, components use a module-level default `RendererSelector`. The provider is optional for basic usage but required for:
- Injecting a custom `TerminalDetector` (e.g., in tests)
- Forcing a specific renderer via `forceRenderer`

---

## System 2: Image Protocol Pipeline

Used by `Heatmap` and `Sparkline` (image mode).

### Data Flow

```
Component props (data, mode, cellPx, colors, …)
    ↓
detectImageProtocol()   →   'kitty' | 'iterm2' | null
    ↓
Build PNG buffer in useMemo:
  • Heatmap:   gradientRgbPalette → pixel grid → createRgbPng()
  • Sparkline: gradientColorFn → buildSparklinePixelGrid → createRgbPng()
    ↓
useImageProtocol({ mode, charCols, charRows, pngBuf, trailingSpace })
    │
    ├── protocol='kitty'
    │     useEffect: stdout.write(encodeKittyUpload(pngBuf, cols, rows, imageId))
    │     return:    kittyLines = encodeKittyPlaceholders(…).split('\n')
    │     cleanup:   stdout.write(encodeKittyDelete(imageId))
    │
    └── protocol='iterm2'
          useEffect: stdout.write(`\x1b[${rows}A\x1b[0G${encodeIterm2(pngBuf, termCols)}\x1b[${rows}B`)
          return:    iterm2Cols = charCols * (trailingSpace ? 2 : 1)
    ↓
Component renders ink React tree:
  • Kitty:   kittyLines.map(line => <Text>{line}</Text>)
  • iTerm2:  data.map(_ => <Text>{' '.repeat(iterm2Cols)}</Text>)
  • Fallback: character mode rendering
```

### Protocol Detection (`src/render/capabilities.ts`)

Priority order (first match wins):

1. `INKHU_IMAGE_PROTOCOL=kitty|iterm2|none` — user override
2. `KITTY_WINDOW_ID` set → `'kitty'`
3. `TERM_PROGRAM=wezterm` or `TERM_PROGRAM=ghostty` → `'kitty'`
4. `TERM_PROGRAM=iterm.app` → `'iterm2'`
5. Otherwise → `null` (character fallback)

VS Code (≥1.110) supports Kitty Graphics but requires `terminal.integrated.enableImages=true`. Users must set `INKHU_IMAGE_PROTOCOL=kitty` to enable.

### Kitty Unicode Placeholder Mode

ink re-renders overwrite raw `\x1b[nA` cursor-positioned images. The solution is Kitty's Unicode Placeholder mode (`U=1`):

1. Image is **uploaded once** with `a=T,U=1,i=<id>` (stored in terminal memory, not displayed)
2. Component renders **U+10EEEE placeholder characters** with diacritical marks encoding row/col indices and the image ID encoded as the foreground RGB color
3. The terminal replaces each placeholder char with the corresponding image cell automatically
4. ink re-renders only update the placeholder chars — the image stays in terminal memory

Each placeholder cell encodes:
```
ESC[38;2;R;G;Bm   ← image ID as RGB foreground
U+10EEEE           ← Kitty placeholder codepoint (string-width=1)
DIACRITICS[row]    ← zero-width combining mark for row index
DIACRITICS[col]    ← zero-width combining mark for col index
U+0020             ← trailing space (when trailingSpace=true)
```

The `DIACRITICS` array has 256 entries covering the full set from the Kitty spec. Grids larger than 256×256 throw a `RangeError`.

### `useImageProtocol` Hook (`src/hooks/useImageProtocol.ts`)

Shared hook eliminating duplicate protocol logic between Heatmap and Sparkline.

```typescript
interface UseImageProtocolOptions {
    mode: 'auto' | 'image' | 'character';
    charCols: number;   // number of placeholder cells (not terminal columns)
    charRows: number;
    pngBuf: Buffer | null;
    trailingSpace?: boolean;  // default true
}

interface UseImageProtocolResult {
    useImage: boolean;
    kittyLines: string[] | null;   // non-null when Kitty is active
    iterm2Cols: number | null;     // non-null when iTerm2 is active
}
```

**Image ID management**: A module-level counter `nextImageId = 1` allocates unique Kitty image IDs across all component instances. Each component instance gets one stable ID via `useRef<number | null>(null)` — initialized once and never changed.

### `trailingSpace` Semantics

Controls how many terminal columns each Kitty placeholder cell occupies:

| `trailingSpace` | Terminal cols/cell | Use case |
|---|---|---|
| `true` (default) | 2 (U+10EEEE + space) | Heatmap — matches character mode "■ " (char + space) |
| `false` | 1 (U+10EEEE only) | Sparkline — matches character mode "█" (1 char/column) |

For iTerm2, `iterm2Cols = charCols * (trailingSpace ? 2 : 1)` gives the total terminal column width of the placeholder region.

### PNG Generation

**`src/render/image/png.ts`** — Zero-dependency PNG encoder using Node.js built-in `zlib.deflateSync`. Accepts `pixels: [r,g,b][][]` (row-major RGB grid), outputs a valid PNG `Buffer`.

**`src/render/image/drawing.ts`** — Shared pixel-grid drawing utilities:
- `gradientColorFn(colors)` — builds a 256-step tinygradient palette, returns `(normalized: 0-1) => [r,g,b]`
- `buildSparklinePixelGrid(data, widthPx, heightPx, min, max, colorFn, bgColor)` — linear interpolation + 2px bright line + darkened area fill

---

## Component Matrix

| Component | System | Renderer/Protocol | Key Props |
|---|---|---|---|
| `LineChart` | Character | braille → block → ascii | `rendererChain` |
| `AreaChart` | Character | braille → block → ascii | `rendererChain` |
| `BarChart` | Character | block → ascii | `rendererChain` |
| `PieChart` | Character | braille → block → ascii | `rendererChain` |
| `Sparkline` | **Both** | character: braille/block; image: Kitty/iTerm2 | `mode`, `variant`, `height`, `colors`, `cellPx` |
| `Heatmap` | **Both** | character: unicode block; image: Kitty/iTerm2 | `mode`, `colors`, `cellPx` |
| `Gauge` | Character (inline) | unicode block chars only | — |
| `PulseBar` | Character (inline) | unicode block chars only | — |
| `BigNumber` | Character (inline) | unicode box-drawing only | — |
| `Table` | Layout | ink Box/Text only | — |
| `Panel` | Layout | ink Box/Text only | — |
| `LogStream` | Layout | ink Box/Text only | — |
| `Grid` | Layout | ink Flexbox only | — |

---

## Key Invariants

1. **DIACRITICS ≤ 256**: `encodeKittyPlaceholders` throws `RangeError` for rows or cols > 256. This is a hard protocol limit from the Kitty spec.

2. **charCols ≠ terminal cols**: `charCols` passed to `useImageProtocol` is always the number of data cells (placeholder grid cells), not terminal column count. Terminal width = `charCols * (trailingSpace ? 2 : 1)`.

3. **Image ID uniqueness**: All components that use `useImageProtocol` share a single module-level `nextImageId` counter. Never instantiate separate counters in components.

4. **pngBuf immutability**: `pngBuf` is produced by `useMemo` and only changes when data changes. The Kitty effect runs only when `pngBuf` changes (by reference), triggering a new upload. The previous image is not explicitly deleted between data updates — Kitty reuses the same image ID.

5. **Character mode pixel canvas**: `Pixel` objects are mutable; `createCanvas` pre-allocates all cells. `setPixel` and `drawLine` mutate in place. Do not share canvas instances across renders.

6. **No System 1/System 2 interop**: The two systems are completely independent. A component cannot use both `rendererChain` and `useImageProtocol` simultaneously — they serve different component archetypes.

---

## Directory Structure

```
src/
├── components/          # React components (both systems)
│   ├── InkHudProvider.tsx   # Context for System 1 (RendererSelector injection)
│   └── useImageProtocol.ts  # Shared hook for System 2
├── core/                # System 1: renderer base classes
│   ├── renderer.ts          # Abstract Renderer + drawing primitives
│   ├── braille.ts           # BrailleRenderer (2×4 px/char)
│   ├── block.ts             # BlockRenderer (2×8 px/char)
│   └── ascii.ts             # AsciiRenderer (1×1 px/char, no-op fallback)
├── detect/              # System 1: terminal capability detection
│   ├── terminal.ts          # TerminalDetector (env var scoring)
│   ├── selector.ts          # RendererSelector (walk chain, pick best)
│   └── types.ts             # TerminalCapabilities, EnvironmentInfo
├── render/              # System 2: image protocol layer
│   ├── capabilities.ts      # detectImageProtocol()
│   └── image/
│       ├── kitty.ts         # encodeKittyUpload / Placeholders / Delete
│       ├── iterm2.ts        # encodeIterm2 (OSC 1337)
│       ├── png.ts           # createRgbPng (zero-dependency)
│       └── drawing.ts       # gradientColorFn, buildSparklinePixelGrid
├── theme/               # ThemeContext + default theme
└── utils/               # gradient helpers, LTTB downsampling
```

---

## Testing Conventions

- **Character renderer tests** (`test/components/*.test.tsx`): Render with `ink-testing-library`, inspect `lastFrame()` for ANSI sequences or character patterns.
- **Image protocol tests** (`test/render/kitty.test.ts`, `test/hooks/useImageProtocol.test.tsx`): Unit-test encoding functions directly; use env var injection (`KITTY_WINDOW_ID`, `TERM_PROGRAM`) with `try/finally` cleanup to test protocol paths.
- **TerminalDetector tests**: Construct with a custom `env` object — never read from `process.env` directly in tests.
- **InkHudProvider injection**: Pass a `detector={mockDetector}` to force a specific renderer in component tests.
