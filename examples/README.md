# ink-hud Examples

This directory contains comprehensive examples demonstrating all ink-hud components and features.

## 📁 Directory Structure

```
examples/
├── dashboard.tsx           # Complete dashboard demo (all components)
├── basic/                  # Individual component examples
│   ├── linechart.tsx       # Line chart with multi-series
│   ├── areachart.tsx       # Area chart with gradients
│   ├── barchart.tsx        # Vertical bar chart
│   ├── barchart-horizontal.tsx  # Horizontal bar chart
│   ├── piechart.tsx        # Pie chart with legend
│   ├── sparkline.tsx       # Compact trend indicator
│   ├── gauge.tsx           # Progress/gauge indicator
│   ├── bignumber.tsx       # KPI display card
│   ├── heatmap.tsx         # Heat map visualization
│   ├── table.tsx           # Interactive data table
│   ├── logstream.tsx       # Real-time log display
│   ├── panel.tsx           # Container with borders
│   └── grid.tsx            # Grid layout system
├── _shared/                # Shared utilities
│   ├── symbolSets.ts       # Symbol set definitions
│   └── cli.ts              # CLI argument parsing
└── run.sh                  # Interactive example runner
```

## 🚀 Running Examples

### Method 1: Interactive Menu

```bash
cd examples
./run.sh
```

### Method 2: Run Individual Components

From the repository root:

```bash
# Chart components
pnpm -C examples component:linechart
pnpm -C examples component:areachart
pnpm -C examples component:barchart
pnpm -C examples component:barchart-horizontal
pnpm -C examples component:piechart
pnpm -C examples component:sparkline
pnpm -C examples component:heatmap

# Metric components
pnpm -C examples component:gauge
pnpm -C examples component:bignumber

# Data components
pnpm -C examples component:table
pnpm -C examples component:logstream

# Layout components
pnpm -C examples component:panel
pnpm -C examples component:grid

# Complete dashboard
pnpm -C examples component:dashboard
```

### Method 3: Direct Execution

```bash
npx tsx examples/dashboard.tsx
npx tsx examples/basic/linechart.tsx
```

## 📊 Component Categories

### Charts
| Example | Description |
|---------|-------------|
| `linechart.tsx` | Multi-series line chart with axes and legend |
| `areachart.tsx` | Stacked area chart with gradient fills |
| `barchart.tsx` | Vertical bar chart with categories |
| `barchart-horizontal.tsx` | Horizontal bar chart layout |
| `piechart.tsx` | Pie chart with percentage labels |
| `sparkline.tsx` | Compact inline trend chart |
| `heatmap.tsx` | 2D grid visualization |

### Metrics
| Example | Description |
|---------|-------------|
| `gauge.tsx` | Circular/linear progress indicator |
| `bignumber.tsx` | Large KPI display with trend |

### Data
| Example | Description |
|---------|-------------|
| `table.tsx` | Sortable, interactive data table |
| `logstream.tsx` | Scrolling log output with highlighting |

### Layout
| Example | Description |
|---------|-------------|
| `panel.tsx` | Bordered container with title |
| `grid.tsx` | Responsive grid layout system |

## 🎯 Dashboard Demo

The `dashboard.tsx` example demonstrates a complete trading system dashboard combining multiple components:

```bash
pnpm -C examples component:dashboard
```

Features showcased:
- Grid layout with multiple panels
- Real-time data simulation
- BigNumber KPIs with trends
- LineChart and AreaChart for time series
- Gauge for load indicators
- Heatmap for correlation data
- LogStream for system events
- Table for data display
