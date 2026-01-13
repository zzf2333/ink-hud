/**
 * ink-hud - Terminal Data Visualization Library
 *
 * Adaptive multi-renderer architecture that automatically selects the optimal rendering method based on terminal capabilities
 */

// ============================================
// Renderer Core
// ============================================

/**
 * Renderer abstract base class and type definitions
 */
export {
    Renderer,
    type RendererType,
    type RendererMetadata,
    type RendererResolution,
} from './core/renderer';

/**
 * Braille Renderer (2x4 dot matrix, 8x resolution)
 */
export { BrailleRenderer } from './core/braille';

/**
 * Block Elements Renderer (2x8 dot matrix, vertical 8x resolution)
 */
export { BlockRenderer } from './core/block';

/**
 * ASCII Renderer (1x3 resolution, maximum compatibility)
 */
export { AsciiRenderer } from './core/ascii';

// ============================================
// Terminal Detection and Renderer Selection
// ============================================

/**
 * Terminal detection type definitions
 */
export type { TerminalCapabilities, EnvironmentInfo } from './detect/types';

/**
 * Terminal capability detector
 */
export { TerminalDetector, terminalDetector } from './detect/terminal';

/**
 * Renderer selector (automatically selects optimal renderer)
 */
export { RendererSelector, rendererSelector } from './detect/selector';

/**
 * InkHud Context Provider (dependency injection)
 */
export {
    InkHudProvider,
    useInkHud,
    useRendererSelector,
    type InkHudProviderProps,
    type InkHudContextValue,
} from './components/InkHudProvider';

/**
 * Theme system
 */
export {
    ThemeProvider,
    useTheme,
    useSemanticColors,
    ONE_DARK_THEME,
    type Theme,
    type SemanticColors,
} from './theme/ThemeContext';

// ============================================
// Utility Functions
// ============================================

/**
 * Data scaling and processing utilities
 */
export { linearScale, normalize, scaleToRange, clamp } from './utils/scale';

/**
 * Gradient color utilities
 */
export { createGradient, assignColors, colorToChalk } from './utils/gradient';

/**
 * Geometry calculation helpers
 */
export {
    midpointCircle,
    pointOnArc,
    arcPoints,
    degreesToRadians,
    radiansToDegrees,
    distanceBetweenPoints,
} from './utils/geometry';

/**
 * Data downsampling utilities
 */
export {
    lttb,
    fixedIntervalDownsampling,
    averageDownsampling,
    minMaxDownsampling,
} from './utils/downsampling';

// ============================================
// React Hooks
// ============================================

/**
 * Data smooth transition Hooks
 */
export {
    useSmooth,
    useSmoothArray,
    useThrottle,
    easeInOutQuad,
    easeLinear,
    easeOutCubic,
    easeInCubic,
    type EasingFunction,
} from './hooks/useSmooth';

// ============================================
// React Components
// ============================================

/**
 * LineChart - Basic line chart component
 */
export { LineChart, type LineChartProps } from './components/LineChart';

/**
 * AreaChart - Basic area chart component
 */
export { AreaChart, type AreaChartProps } from './components/AreaChart';

/**
 * BarChart - Basic bar chart component
 */
export { BarChart, type BarChartProps } from './components/BarChart';

/**
 * PieChart - Pie chart component
 */
export { PieChart, type PieChartProps, type PieChartDataItem } from './components/PieChart';

/**
 * Sparkline - Mini trend chart component
 */
export { Sparkline, type SparklineProps } from './components/Sparkline';

// ============================================
// Common Sub-components
// ============================================

/**
 * Axis - Coordinate axis component
 */
export { Axis, type AxisProps } from './components/common/Axis';

/**
 * Grid - Layout component
 */
export { Grid, GridItem, type GridProps, type GridItemProps } from './components/Grid';

/**
 * Legend - Chart legend component
 */
export {
    Legend,
    type LegendProps,
    type LegendItem,
} from './components/common/Legend';

/**
 * Panel - Container panel component
 */
export { Panel, type PanelProps } from './components/Panel';

/**
 * Gauge - Gauge/progress bar component
 */
export { Gauge, type GaugeProps } from './components/Gauge';

/**
 * BigNumber - Key metric card component
 */
export { BigNumber, type BigNumberProps } from './components/BigNumber';

/**
 * Heatmap - Heatmap component
 */
export { Heatmap, type HeatmapProps } from './components/Heatmap';

/**
 * LogStream - Log stream component
 */
export { LogStream, type LogStreamProps } from './components/LogStream';

/**
 * Table - Table component
 */
export { Table, type TableProps, type TableColumn } from './components/Table';

/**
 * PulseBar - network connection status component
 */
export {
    PulseBar,
    type PulseBarProps,
    type PingStatus,
    type PingRecord,
} from './components/PulseBar';
