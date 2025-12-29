/**
 * Common type definitions for Chart components
 *
 * Unified base property interface for all chart components
 */

import type { RendererType } from '../../core/renderer';
import type { ColorPalette } from '../../utils/gradient';

/**
 * Basic chart dimensions and renderer configuration
 */
export interface BaseChartProps {
    /** Chart width (character count) */
    width?: number;

    /** Chart height (character rows) */
    height?: number;

    /** Manually specify Renderer type */
    renderer?: RendererType;

    /** Custom renderer fallback chain */
    rendererChain?: RendererType[];

    /**
     * Width offset
     * @deprecated Recommend wrapping chart with `<Panel>`, Panel automatically handles border overhead
     */
    widthOffset?: number;

    /**
     * Height offset
     * @deprecated Recommend wrapping chart with `<Panel>`, Panel automatically handles border overhead
     */
    heightOffset?: number;
}

/**
 * Legend configuration
 */
export interface LegendProps {
    /** Whether to show legend (default true) */
    showLegend?: boolean;

    /** Legend position (default 'right') */
    legendPosition?: 'right' | 'bottom' | 'top';
}

/**
 * Color configuration
 */
export interface ColorProps {
    /** Color array (auto-assigned if not specified) */
    colors?: string[];

    /** Palette name or custom color array */
    colorPalette?: ColorPalette;
}

/**
 * Axis configuration (shared by LineChart/AreaChart/BarChart)
 */
export interface AxisProps {
    /** Whether to show axis (default true) */
    showAxis?: boolean;

    /** Whether to show X-axis (defaults to showAxis) */
    showXAxis?: boolean;

    /** Whether to show Y-axis (defaults to showAxis) */
    showYAxis?: boolean;

    /** X-axis label */
    xAxisLabel?: string;

    /** Y-axis label */
    yAxisLabel?: string;

    /** X-axis tick count (default 5) */
    xTickCount?: number;

    /** Y-axis tick count (default 5) */
    yTickCount?: number;

    /** X-axis tick formatter function */
    xTickFormat?: (value: number) => string;

    /** Y-axis tick formatter function */
    yTickFormat?: (value: number) => string;

    /** Whether to force X-axis ticks to be integers (default true) */
    xIntegerScale?: boolean;

    /** Whether to force Y-axis ticks to be integers (default false) */
    yIntegerScale?: boolean;
}

/**
 * Time series data configuration (shared by LineChart/AreaChart/BarChart)
 */
export interface SeriesDataProps {
    /** Multi-series data */
    series?: Array<{
        name: string;
        data: number[];
        color?: string;
    }>;

    /** Single-series data (simplified) */
    data?: number[];

    /** Single-series name (simplified) */
    seriesName?: string;
}

/**
 * Complete time series chart properties (shared by LineChart/AreaChart)
 */
export type TimeSeriesChartProps = BaseChartProps &
    LegendProps &
    ColorProps &
    AxisProps &
    SeriesDataProps;
