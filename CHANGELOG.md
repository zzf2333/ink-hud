# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/zzf2333/ink-hud/compare/v0.1.2...HEAD
[v0.1.2]: https://github.com/zzf2333/ink-hud/compare/v0.1.1...v0.1.2
[v0.1.1]: https://github.com/zzf2333/ink-hud/compare/v0.1.0...v0.1.1
[v0.1.0]: https://github.com/zzf2333/ink-hud/releases/tag/v0.1.0
