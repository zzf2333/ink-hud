# ink-hud 架构文档

## 概述

ink-hud 基于 [ink](https://github.com/vadimdemedes/ink)（CLI 的 React）渲染交互式终端仪表盘组件。库内包含**两套完全独立的渲染系统**并行运行：字符渲染链负责折线图/面积图/柱状图/饼图，图像协议管道负责位图渲染能力的组件（Heatmap、Sparkline）。两套系统不共享任何代码，各自独立判断终端能力。

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ink-hud 组件层                               │
│                                                                     │
│  LineChart  AreaChart  BarChart  PieChart  │  Heatmap   Sparkline   │
│                                            │                        │
│      ↓ useChartRenderer(kind)              │    ↓ mode prop         │
│  ┌─────────────────────────┐               │  ┌─────────────────┐   │
│  │  系统一：字符渲染链        │               │  │  系统二：         │   │
│  │  Character Renderer     │               │  │  图像协议管道    │   │
│  └─────────────────────────┘               │  └─────────────────┘   │
└────────────────────────────────────────────┼────────────────────────┘
                                             │
         通过 ink React 树输出               │  通过 stdout 转义序列输出
         （纯 ANSI 文本）                    │  + ink 占位符字符
```

---

## 系统一：字符渲染链

用于 `LineChart`、`AreaChart`、`BarChart`、`PieChart` 以及 `Sparkline`（字符模式）。

### 数据流

```
组件 props
    ↓
useChartRenderer(kind)   ← kind = 'line' | 'area' | 'bar' | 'pie'
    ↓
InkHudContext.getRendererFor(kind)   ← 由 <InkHudProvider> 提供
    ↓
合并用户 renderers 配置与 DEFAULT_CHART_RENDERERS
    ↓
TerminalDetector.detect()  →  TerminalCapabilities { score: 0-100, ... }
    ↓
若目标 renderer 不支持 → 静默兜底至 BlockRenderer
    ↓
renderer: BrailleRenderer | BlockRenderer
    ↓
renderer.createCanvas(pixelW, pixelH)   →   Pixel[][]
    ↓
在 canvas 上绘制  (drawLine / setPixel / drawArc …)
    ↓
renderer.renderCanvas(canvas, w, h)   →   RenderedLine[]
    ↓
通过 ink React 树输出 <Box> + <Text>
```

### 终端评分算法（`src/detect/terminal.ts`）

`TerminalDetector` 读取 `LANG`、`TERM`、`COLORTERM`、`TERM_PROGRAM` 并计算 0–100 分：

| 特性 | 加分 |
|---|---|
| UTF-8（`LANG` 包含 `UTF-8`） | +20 |
| Unicode（与 UTF-8 相同） | +10 |
| Braille（`TERM_PROGRAM` 在白名单中） | +30 |
| Block Elements（与 Unicode 相同） | +10 |
| 颜色（`TERM` 含 `color`/`256color` 或 `COLORTERM` 已设置） | +15 |
| True color（`COLORTERM=truecolor` 或 `24bit`） | +15 |

Braille 白名单：`iterm`、`warp`、`alacritty`、`kitty`、`wezterm`、`hyper`、`tabby`、`rio`。

### 渲染器参数对比

| 渲染器 | minScore | 分辨率（H×V 像素/字符） | 需要 UTF-8 | 需要 Unicode |
|---|---|---|---|---|
| BrailleRenderer | 80 | 2×4 | ✓ | ✓ |
| BlockRenderer | 30 | 2×8 | ✓ | ✓ |

BlockRenderer 是最终兜底（minScore=30，任何 UTF-8 终端均可达到）。

### 渲染器配置（`DEFAULT_CHART_RENDERERS`）

每个图表类型预设了视觉最优的 renderer，无需任何配置：

| 图表类型 | 默认渲染器 | 原因 |
|---|---|---|
| `line` | braille | 2×4 子像素网格使斜线更平滑 |
| `area` | braille | 曲线下方填充分辨率更细腻 |
| `bar` | block | 2×2 格渲染矩形边更整齐 |
| `pie` | braille | 径向像素受益于更高分辨率 |

通过 `InkHudProvider` 的 `renderers` prop 可按图表类型覆盖：

```tsx
// 标准用法（自动检测，每图最优渲染器）
<InkHudProvider>
  <Dashboard />
</InkHudProvider>

// 覆盖特定图表类型
<InkHudProvider renderers={{ line: 'block', bar: 'braille' }}>
  <Dashboard />
</InkHudProvider>

// 注入 mock 检测器（测试环境）
<InkHudProvider detector={mockDetector}>
  <Dashboard />
</InkHudProvider>
```

### InkHudProvider

`<InkHudProvider>` 包裹应用，向子树提供 `InkHudContext`。不使用时，组件回退到模块级默认 `RendererSelector`。以下场景必须使用 Provider：

- 注入自定义 `TerminalDetector`（如测试环境）
- 通过 `renderers` prop 覆盖特定图表类型的渲染器

---

## 系统二：图像协议管道

用于 `Heatmap` 和 `Sparkline`（图像模式）。

### 数据流

```
组件 props（data、mode、cellPx、colors …）
    ↓
detectImageProtocol()   →   'kitty' | 'iterm2' | null
    ↓
在 useMemo 中构建 PNG buffer：
  • Heatmap：   gradientRgbPalette → 像素网格 → createRgbPng()
  • Sparkline： gradientColorFn → buildSparklinePixelGrid → createRgbPng()
    ↓
useImageProtocol({ mode, charCols, charRows, pngBuf, trailingSpace })
    │
    ├── protocol='kitty'
    │     useEffect: stdout.write(encodeKittyUpload(pngBuf, cols, rows, imageId))
    │     返回：    kittyLines = encodeKittyPlaceholders(…).split('\n')
    │     清理：    stdout.write(encodeKittyDelete(imageId))
    │
    └── protocol='iterm2'
          useEffect: stdout.write(`\x1b[${rows}A\x1b[0G${encodeIterm2(pngBuf, termCols)}\x1b[${rows}B`)
          返回：    iterm2Cols = charCols * (trailingSpace ? 2 : 1)
    ↓
组件渲染 ink React 树：
  • Kitty：   kittyLines.map(line => <Text>{line}</Text>)
  • iTerm2：  data.map(_ => <Text>{' '.repeat(iterm2Cols)}</Text>)
  • 兜底：    字符模式渲染
```

### 协议检测（`src/render/capabilities.ts`）

按优先级顺序，第一个匹配项生效：

1. `INKHU_IMAGE_PROTOCOL=kitty|iterm2|none` — 用户手动覆盖
2. `KITTY_WINDOW_ID` 已设置 → `'kitty'`
3. `TERM_PROGRAM=wezterm` 或 `TERM_PROGRAM=ghostty` → `'kitty'`
4. `TERM_PROGRAM=iterm.app` → `'iterm2'`
5. 否则 → `null`（回退到字符模式）

VS Code（≥1.110）支持 Kitty Graphics，但需要开启 `terminal.integrated.enableImages=true`，同时手动设置 `INKHU_IMAGE_PROTOCOL=kitty`。

### Kitty Unicode Placeholder 模式

ink 重渲染会覆盖通过 `\x1b[nA` 光标定位写入的图像。解决方案是 Kitty 的 Unicode Placeholder 模式（`U=1`）：

1. 图像以 `a=T,U=1,i=<id>` **上传一次**（存入终端内存，不直接显示）
2. 组件渲染 **U+10EEEE 占位符字符**，通过附加组合附标记编码行列索引，图像 ID 编码在前景 RGB 颜色中
3. 终端自动将每个占位符替换为对应的图像格
4. ink 重渲染只更新占位符字符——图像始终保留在终端内存中

每个占位符格的编码结构：

```
ESC[38;2;R;G;Bm   ← 图像 ID 编码为 RGB 前景色
U+10EEEE           ← Kitty 占位符码点（字符宽度=1）
DIACRITICS[row]    ← 零宽附标记，编码行索引
DIACRITICS[col]    ← 零宽附标记，编码列索引
U+0020             ← 尾随空格（trailingSpace=true 时）
```

`DIACRITICS` 数组共 256 项，覆盖 Kitty 规范的完整集合。超过 256×256 的网格会抛出 `RangeError`。

### `useImageProtocol` Hook（`src/hooks/useImageProtocol.ts`）

提取自 Heatmap 和 Sparkline 的共享 Hook，消除约 60 行重复的协议逻辑。

```typescript
interface UseImageProtocolOptions {
    mode: 'auto' | 'image' | 'character';
    charCols: number;   // 占位符格数量（非终端列数）
    charRows: number;
    pngBuf: Buffer | null;
    trailingSpace?: boolean;  // 默认 true
}

interface UseImageProtocolResult {
    useImage: boolean;
    kittyLines: string[] | null;   // Kitty 激活时非 null
    iterm2Cols: number | null;     // iTerm2 激活时非 null
}
```

**图像 ID 管理**：模块级计数器 `nextImageId = 1` 跨所有组件实例分配唯一的 Kitty 图像 ID。每个组件实例通过 `useRef<number | null>(null)` 获得一个稳定 ID，初始化后永不改变。

### `trailingSpace` 语义

控制每个 Kitty 占位符格占用的终端列数：

| `trailingSpace` | 终端列数/格 | 适用场景 |
|---|---|---|
| `true`（默认） | 2（U+10EEEE + 空格） | Heatmap — 匹配字符模式 "■ "（字符 + 空格）的宽度 |
| `false` | 1（仅 U+10EEEE） | Sparkline — 匹配字符模式 "█"（每列一个字符）的宽度 |

iTerm2 模式下：`iterm2Cols = charCols * (trailingSpace ? 2 : 1)`，即占位区域的总终端列宽。

### PNG 生成

**`src/render/image/png.ts`** — 零依赖 PNG 编码器，使用 Node.js 内置 `zlib.deflateSync`。接受 `pixels: [r,g,b][][]`（行优先 RGB 网格），输出合法的 PNG `Buffer`。

**`src/render/image/drawing.ts`** — 共享像素网格绘制工具：
- `gradientColorFn(colors)` — 基于 tinygradient 构建 256 步调色板，返回 `(normalized: 0-1) => [r,g,b]`
- `buildSparklinePixelGrid(data, widthPx, heightPx, min, max, colorFn, bgColor)` — 线性插值 + 2px 亮线 + 暗色填充区域

---

## 组件渲染矩阵

| 组件 | 使用系统 | 渲染器/协议 | 关键 Props |
|---|---|---|---|
| `LineChart` | 字符渲染链 | braille（默认），可覆盖 | `InkHudProvider renderers={{ line: ... }}` |
| `AreaChart` | 字符渲染链 | braille（默认），可覆盖 | `InkHudProvider renderers={{ area: ... }}` |
| `BarChart` | 字符渲染链 | block（默认），可覆盖 | `InkHudProvider renderers={{ bar: ... }}` |
| `PieChart` | 字符渲染链 | braille（默认），可覆盖 | `InkHudProvider renderers={{ pie: ... }}` |
| `Sparkline` | **双系统** | 字符：braille/block；图像：Kitty/iTerm2 | `mode`, `variant`, `height`, `colors`, `cellPx` |
| `Heatmap` | **双系统** | 字符：unicode block；图像：Kitty/iTerm2 | `mode`, `colors`, `cellPx` |
| `Gauge` | 字符（内联） | 仅 unicode block 字符 | — |
| `PulseBar` | 字符（内联） | 仅 unicode block 字符 | — |
| `BigNumber` | 字符（内联） | 仅 unicode 盒绘制字符 | — |
| `Table` | 布局 | 仅 ink Box/Text | — |
| `Panel` | 布局 | 仅 ink Box/Text | — |
| `LogStream` | 布局 | 仅 ink Box/Text | — |
| `Grid` | 布局 | 仅 ink Flexbox | — |

---

## 关键不变式

1. **DIACRITICS ≤ 256**：`encodeKittyPlaceholders` 对 rows 或 cols > 256 抛出 `RangeError`。这是 Kitty 协议规范的硬限制。

2. **charCols ≠ 终端列数**：传入 `useImageProtocol` 的 `charCols` 始终是数据格数（占位符网格格数），不是终端列数。终端列宽 = `charCols * (trailingSpace ? 2 : 1)`。

3. **图像 ID 唯一性**：所有使用 `useImageProtocol` 的组件共享同一个模块级 `nextImageId` 计数器，禁止在组件内单独维护计数器。

4. **pngBuf 不可变性**：`pngBuf` 由 `useMemo` 生成，只在数据变化时更新。Kitty effect 仅在 `pngBuf` 引用变化时触发新上传，相同 imageId 重复使用，无需显式删除旧图像。

5. **字符模式像素 canvas**：`Pixel` 对象可变；`createCanvas` 预分配所有格。`setPixel` 和 `drawLine` 原地修改。禁止跨渲染共享 canvas 实例。

6. **两套系统完全隔离**：组件不能同时使用 `useChartRenderer` 和 `useImageProtocol`，两者服务于不同类型的组件。

---

## 目录结构

```
src/
├── components/              # React 组件（两套系统均在此）
│   ├── InkHudProvider.tsx   # 系统一的 Context（RendererSelector 注入）
│   └── useImageProtocol.ts  # 系统二的共享 Hook
├── core/                    # 系统一：渲染器基类
│   ├── renderer.ts          # 抽象 Renderer + 绘图原语
│   ├── braille.ts           # BrailleRenderer（2×4 像素/字符）
│   └── block.ts             # BlockRenderer（2×8 像素/字符，最终兜底）
├── symbols.ts               # 集中装饰字符常量（按用途分组：trend/legend/bar/border…）
├── detect/                  # 系统一：终端能力检测
│   ├── terminal.ts          # TerminalDetector（环境变量评分）
│   ├── selector.ts          # RendererSelector（isRendererTypeSupported 供 Provider 使用）
│   └── types.ts             # TerminalCapabilities、EnvironmentInfo
├── render/                  # 系统二：图像协议层
│   ├── capabilities.ts      # detectImageProtocol()
│   └── image/
│       ├── kitty.ts         # encodeKittyUpload / Placeholders / Delete
│       ├── iterm2.ts        # encodeIterm2（OSC 1337）
│       ├── png.ts           # createRgbPng（零依赖）
│       └── drawing.ts       # gradientColorFn、buildSparklinePixelGrid
├── theme/                   # ThemeContext + 默认主题
└── utils/                   # 渐变工具、LTTB 降采样等
```

---

## 测试约定

- **字符渲染器测试**（`test/components/*.test.tsx`）：使用 `ink-testing-library` 渲染，通过 `lastFrame()` 检查 ANSI 序列或字符模式。
- **图像协议测试**（`test/render/kitty.test.ts`、`test/hooks/useImageProtocol.test.tsx`）：直接对编码函数做单元测试；通过环境变量注入（`KITTY_WINDOW_ID`、`TERM_PROGRAM`）配合 `try/finally` 清理来测试各协议路径。
- **TerminalDetector 测试**：构造时传入自定义 `env` 对象，禁止在测试中直接读取 `process.env`。
- **InkHudProvider 注入**：在组件测试中传入 `detector={mockDetector}` 强制指定渲染器。
