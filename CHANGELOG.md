# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking Changes
- **Renderer selection centralised in `InkHudProvider`**: The `renderer` and `rendererChain` props have been removed from `LineChart`, `AreaChart`, `BarChart`, and `PieChart`. The `forceRenderer` prop has been removed from `InkHudProvider`.
  - **Migration**: Use `<InkHudProvider renderers={{ line: 'block', bar: 'braille' }}>` to override the renderer for specific chart kinds. Unspecified kinds keep their pre-tuned defaults (line/area/pie → braille; bar → block).
- **`selectBest` removed from `InkHudContextValue`**: No longer part of the public context interface.

### Added
- **`ChartKind`** type (`'line' | 'area' | 'bar' | 'pie'`) and **`ChartRenderers`** (`Record<ChartKind, RendererType>`) exported from the package.
- **`DEFAULT_CHART_RENDERERS`** exported constant with pre-tuned per-chart defaults.
- **`getRendererFor(kind: ChartKind): Renderer`** added to `InkHudContextValue`.
- **`renderers?: Partial<ChartRenderers>`** prop on `InkHudProvider` for per-kind override.
- **Dev-mode fallback warning**: When a configured renderer is not supported by the current terminal, `InkHudProvider` now emits a one-time `console.warn` in non-production environments. In production (`NODE_ENV=production`) the fallback is still silent.

### Deprecated
- **`RendererSelector.selectBest()`**: Use `<InkHudProvider renderers={{...}}>` + `useChartRenderer(kind)` instead. Method retained as a low-level escape hatch.
- **`widthOffset` / `heightOffset` props** on `BaseChartProps` and `PieChartProps`: Removed. Wrap charts with `<Panel>` which automatically handles border overhead.

### Breaking Changes (soft)
- **`renderer?: never` / `rendererChain?: never`** added to `BaseChartProps` and `PieChartProps`. Passing these props now produces a TypeScript error with a migration message. The underlying behaviour was already removed in the previous release; this change only improves the diagnostic.

### Added (previous)
- **Image protocol rendering for Heatmap**: The `Heatmap` component now accepts a `mode` prop (`'auto' | 'image' | 'character'`). In `'auto'` mode it auto-detects the terminal's image protocol (Kitty Graphics / iTerm2 Inline Images) and renders the heatmap as a true bitmap, falling back to character mode when unsupported.

- **Image protocol rendering for Sparkline**: `Sparkline` now accepts `mode`, `height`, `colors`, and `cellPx` props for image mode rendering. In `'auto'` or `'image'` mode the sparkline renders as a smooth area chart bitmap with configurable height and gradient colors.
- **`detectImageProtocol()`**: New function that detects whether the current terminal supports Kitty Graphics or iTerm2 Inline Images. Override with `INKHU_IMAGE_PROTOCOL=kitty|iterm2|none`.
- **`createRgbPng()`** / **`hexToRgb()`**: Zero-dependency PNG encoder built on Node.js's built-in `zlib`. Used internally by image-mode components.
- **`encodeKitty()`** / **`encodeIterm2()`**: Low-level encoders for Kitty Graphics Protocol (APC sequences) and iTerm2 Inline Images (OSC 1337). Available for custom rendering use cases.
- **`encodeKittyUpload()`** / **`encodeKittyPlaceholders()`** / **`encodeKittyDelete()`**: Kitty Unicode Placeholder API (`U=1`). Images are stored by ID and referenced by U+10EEEE placeholder characters, making image rendering compatible with ink's React reconciler (re-renders no longer overwrite the image).
- **`gradientColorFn()`** / **`buildSparklinePixelGrid()`**: Shared image-mode drawing utilities for building RGB pixel grids from data series.

### Breaking Changes
- **ASCII variant removed** (`PulseBar`, `Gauge`, `Heatmap`, `BigNumber`, `Sparkline`): The `variant: 'ascii'` option has been removed from all components. `Sparkline` now accepts `'block' | 'braille'` only. The `fontStyle: 'ascii'` option has been removed from `BigNumber`.
  - **Migration**: If you need ASCII-style output, use the existing `fillChar` / `emptyChar` props on `Gauge`, or the `char` prop on `Heatmap`, to supply custom characters.

### Removed
- `BigNumber` `variant` prop (trend arrow style) — Unicode arrows are now always used (▲ ▼ ─).
- `BigNumber` `fontStyle: 'ascii'` — BigNumber large-font now supports `'block'` and `'braille'` only.

## [v0.1.3] - 2026-01-13

### Fixed
- **PulseBar**: Default to a fully muted bar when no records are provided; keep demo in sync.

## [v0.1.2] - 2026-01-13

### Added
- **PulseBar Component**: Heartbeat-style connection status visualization with unicode/ascii variants.
- **PulseBar Example**: Added example runner and demo entry under `examples/basic`.
- **PulseBar Tests**: Added coverage for borders, variants, and bar rendering.
- **Documentation**: Added PulseBar docs and screenshots to component guides and README.
- **Release Workflow**: Generate GitHub releases from `CHANGELOG.md`.

## [v0.1.1] - 2026-01-07

### Fixed
- **Grid Layout**: Fixed pixel rounding errors in column width calculation ensuring precise alignment. `Grid` now distributes remainder pixels across columns.
- **Chart Sizing**: Fixed charts overflowing their container by enforcing strict height constraints in `ChartContainer`.
- **PieChart Rendering**: Fixed `PieChart` not centering correctly and being truncated at boundaries. Added proper alignment and container sizing.
- **Panel Height**: Fixed `Panel` not propagating height context to children when height is a string (e.g., "100%").
- **Chart Defaults**: Improved default height handling in `chartUtils` to prevent hardcoded fallbacks.

## [v0.1.0] - TBD

### Added
- 🎨 Braille character rendering with 8x resolution
- ⚛️ React-based component architecture using Ink
- 📊 Sparkline component for trend visualization
- 🧪 Comprehensive test suite with >90% coverage
- 📦 npm package configuration with TypeScript support

[unreleased]: https://github.com/zzf2333/ink-hud/compare/v0.1.3...HEAD
[v0.1.3]: https://github.com/zzf2333/ink-hud/compare/v0.1.2...v0.1.3
[v0.1.2]: https://github.com/zzf2333/ink-hud/compare/v0.1.1...v0.1.2
[v0.1.1]: https://github.com/zzf2333/ink-hud/compare/v0.1.0...v0.1.1
[v0.1.0]: https://github.com/zzf2333/ink-hud/releases/tag/v0.1.0
