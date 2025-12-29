# API Reference

Complete API reference for ink-hud components and utilities.

## Components

### Chart Components

#### LineChart
```tsx
import { LineChart } from 'ink-hud';

interface LineChartProps {
    series: SeriesData[];
    width?: number;
    height?: number;
    showXAxis?: boolean;
    showYAxis?: boolean;
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    renderer?: RendererType;
    xTickFormat?: (value: number) => string;
    yTickFormat?: (value: number) => string;
}
```

#### AreaChart
```tsx
import { AreaChart } from 'ink-hud';

interface AreaChartProps extends LineChartProps {
    stacked?: boolean;
    fillOpacity?: number;
}
```

#### BarChart
```tsx
import { BarChart } from 'ink-hud';

interface BarChartProps {
    series: SeriesData[];
    width?: number;
    height?: number;
    orientation?: 'vertical' | 'horizontal';
    gap?: number;
    showValues?: boolean;
    renderer?: RendererType;
}
```

#### PieChart
```tsx
import { PieChart } from 'ink-hud';

interface PieChartProps {
    data: PieData[];
    width?: number;
    height?: number;
    showLegend?: boolean;
    legendPosition?: 'right' | 'bottom';
    renderer?: RendererType;
}

interface PieData {
    name: string;
    value: number;
    color?: string;
}
```

#### Sparkline
```tsx
import { Sparkline } from 'ink-hud';

interface SparklineProps {
    data: number[];
    width?: number;
    color?: string;
    renderer?: RendererType;
}
```

#### Heatmap
```tsx
import { Heatmap } from 'ink-hud';

interface HeatmapProps {
    data: number[][];
    variant?: 'unicode' | 'ascii';
    colorScale?: string[];
}
```

### Metric Components

#### BigNumber
```tsx
import { BigNumber } from 'ink-hud';

interface BigNumberProps {
    value: number;
    label?: string;
    trend?: number;
    color?: string;
    decimals?: number;
    font?: 'braille' | 'ascii';
}
```

#### Gauge
```tsx
import { Gauge } from 'ink-hud';

interface GaugeProps {
    value: number;
    max?: number;
    label?: string;
    color?: string;
    showPercentage?: boolean;
    renderer?: RendererType;
}
```

### Data Components

#### Table
```tsx
import { Table, TableColumn } from 'ink-hud';

interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    zebra?: boolean;
    onSort?: (column: TableColumn<T>, index: number) => void;
}

interface TableColumn<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    align?: 'left' | 'center' | 'right';
    width?: number;
}
```

#### LogStream
```tsx
import { LogStream } from 'ink-hud';

interface LogStreamProps {
    logs: string[];
    maxLines?: number;
    highlightPatterns?: HighlightPattern[];
}

interface HighlightPattern {
    pattern: RegExp;
    color: string;
}
```

### Layout Components

#### Panel
```tsx
import { Panel } from 'ink-hud';

interface PanelProps {
    title?: string;
    borderColor?: string;
    padding?: number;
    children: React.ReactNode;
}
```

#### Grid / GridItem
```tsx
import { Grid, GridItem } from 'ink-hud';

interface GridProps {
    columns?: number;
    width?: number;
    rowHeight?: number;
    gap?: number;
    children: React.ReactNode;
}

interface GridItemProps {
    span?: number;
    rowSpan?: number;
    children: React.ReactNode;
}
```

#### Legend
```tsx
import { Legend, LegendItem } from 'ink-hud';

interface LegendProps {
    items: LegendItem[];
    layout?: 'horizontal' | 'vertical';
}

interface LegendItem {
    name: string;
    color: string;
    symbol?: string;
}
```

---

## Types

### SeriesData
```tsx
interface SeriesData {
    name: string;
    data: number[];
    color?: string;
}
```

### RendererType
```tsx
type RendererType = 'braille' | 'block' | 'ascii' | 'auto';
```

---

## Hooks

### useSmooth
Smooth value transitions for animations.

```tsx
import { useSmooth } from 'ink-hud';

const smoothValue = useSmooth(targetValue, {
    duration?: number;      // Animation duration in ms (default: 500)
    easing?: EasingType;    // Easing function (default: 'easeInOutQuad')
});

type EasingType = 
    | 'linear'
    | 'easeInCubic'
    | 'easeOutCubic'
    | 'easeInOutQuad';
```

---

## Utilities

### Downsampling
```tsx
import { lttb, fixedIntervalDownsampling, averageDownsampling, minMaxDownsampling } from 'ink-hud';

// Largest Triangle Three Buckets (best for trends)
const downsampled = lttb(data: number[], targetSize: number): number[];

// Fixed interval sampling
const sampled = fixedIntervalDownsampling(data: number[], targetSize: number): number[];

// Average-based downsampling
const averaged = averageDownsampling(data: number[], targetSize: number): number[];

// Min-max downsampling (preserves extremes)
const minMax = minMaxDownsampling(data: number[], targetSize: number): number[];
```

### Geometry
```tsx
import { 
    midpointCircle, 
    pointOnArc, 
    arcPoints,
    degreesToRadians,
    radiansToDegrees,
    distanceBetweenPoints 
} from 'ink-hud';
```

### Scale
```tsx
import { linearScale, clamp, lerp } from 'ink-hud';

const scale = linearScale(domainMin, domainMax, rangeMin, rangeMax);
const scaled = scale(value);

const clamped = clamp(value, min, max);
const interpolated = lerp(start, end, t);
```

### Gradient
```tsx
import { assignColors, VS_CODE_DARK_PALETTE } from 'ink-hud';

const colors = assignColors(count: number, palette?: string[]): string[];
```

---

## Renderers

### RendererSelector
```tsx
import { RendererSelector, TerminalDetector } from 'ink-hud';

const detector = new TerminalDetector();
const selector = new RendererSelector(detector);

const renderer = selector.selectBest();
const capabilities = detector.detect();
```

### Provider
```tsx
import { InkHudProvider } from 'ink-hud';

<InkHudProvider rendererSelector={selector}>
    <App />
</InkHudProvider>
```

---

## Theme

### ThemeProvider
```tsx
import { ThemeProvider, ONE_DARK_THEME } from 'ink-hud';

interface Theme {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        text: string;
        textSecondary: string;
        series: string[];
        gradient: string[];
    };
}

<ThemeProvider theme={customTheme}>
    <App />
</ThemeProvider>
```
