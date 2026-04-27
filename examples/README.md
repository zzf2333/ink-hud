# ink-hud Examples

Interactive 5-page showcase demo covering every ink-hud component.

## Run

```bash
pnpm demo          # from the repo root
# or
node --import tsx demo.tsx
```

## Pages

| Key | Page      | Components shown |
|-----|-----------|-----------------|
| `1` | Overview  | BigNumber (with trendDirection/trendLabel) · Gauge · LineChart · Sparkline (block/braille/gradient) |
| `2` | Charts    | LineChart · AreaChart · BarChart (vertical + horizontal) · PieChart · InkHudProvider renderer toggle |
| `3` | Image     | Heatmap (auto mode + character mode, labeled axes) · Sparkline (all three modes) · image-protocol detection |
| `4` | Streams   | LogStream · PulseBar · Table (interactive sort) |
| `5` | Layout    | Panel (borderStyle × titleAlignment) · Gauge (custom fillChar/emptyChar, negative range) · Grid span composition |

## Keyboard

| Key | Action |
|-----|--------|
| `q` | Quit |
| `1` – `5` | Jump to page |
| `← →` or `Tab` / `Shift+Tab` | Navigate pages |
| `r` *(Charts page only)* | Toggle BarChart renderer block ↔ braille |
| `Tab` / `Enter` *(Streams page — Table)* | Move header focus / sort column |
