import { useContext } from 'react';
import type { Renderer } from '../../core/renderer';
import { type ColorPalette, assignColors } from '../../utils/gradient';
import { linearScale } from '../../utils/scale';
import { GridItemContext } from '../Grid';

/**
 * Chart Layout Configuration
 */
/* ... existing code ... */

export function resolveSeriesColors(
    series: ChartSeries[],
    colors?: string[],
    palette?: ColorPalette,
): string[] {
    if (series.length === 0) {
        return [];
    }
    // Prioritize explicit colors array if provided and sufficient
    if (colors && colors.length >= series.length) {
        return colors.slice(0, series.length);
    }
    // Otherwise use palette (defaults to 'one-dark' inside assignColors)
    // If colors is partially provided, we might want to use it?
    // Current logic: if colors is provided but not enough, assignColors generates new ones.
    // We pass 'colors' as baseColors to assignColors if palette is not specified?
    // Actually assignColors 2nd arg is 'palette' now.

    // If colors is provided, treat it as a custom palette
    if (colors && colors.length > 0) {
        return assignColors(series.length, colors);
    }

    return assignColors(series.length, palette);
}

/**
 * Chart Layout Configuration
 */
export interface ChartLayoutConfig {
    /** Minimum width of the chart (default: 10) */
    minWidth?: number;
    /** Minimum height of the chart (default: 1) */
    minHeight?: number;
    /**
     * Width offset (default: 0)
     * @deprecated Recommend wrapping chart with `<Panel>`, Panel automatically handles border overhead
     */
    widthOffset?: number;
    /**
     * Height offset (default: 0)
     * @deprecated Recommend wrapping chart with `<Panel>`, Panel automatically handles border overhead
     */
    heightOffset?: number;
    /** X-axis visibility */
    showXAxis?: boolean;
    /** Y-axis visibility */
    showYAxis?: boolean;
    /** Legend visibility */
    showLegend?: boolean;
    /** Legend position */
    legendPosition?: 'top' | 'bottom' | 'right';
    /** X-axis label */
    xAxisLabel?: string;
    /** Y-axis label */
    yAxisLabel?: string;
    /** Y-axis tick count */
    yTickCount?: number;
    /** Y-axis tick formatter */
    yTickFormat?: (value: number) => string;
    /** Default width if not in grid (default: 60) */
    defaultWidth?: number;
    /** Default height if not in grid (default: 15) */
    defaultHeight?: number;
    /** Data min value */
    min: number;
    /** Data max value */
    max: number;
}

/**
 * Chart Layout Result
 */
export interface ChartLayoutResult {
    /** Total width of the component */
    totalWidth: number;
    /** Total height of the component */
    totalHeight: number;
    /** Width of the plot area (canvas) */
    plotWidth: number;
    /** Height of the plot area (canvas) */
    plotHeight: number;
    /** Width of the Y-axis label area */
    yAxisWidth: number;
    /** Height of the legend area (if top/bottom) */
    legendHeight: number;
    /** Width of the legend area (if right) */
    legendWidth: number;
    /** Height of the X-axis area */
    xAxisHeight: number;
}

/**
 * Hook to calculate consistent chart layout
 */
export function useChartLayout(
    props: { width?: number; height?: number },
    config: ChartLayoutConfig,
): ChartLayoutResult {
    const {
        minWidth = 10,
        widthOffset = 0,
        heightOffset = 0,
        showXAxis = true,
        showYAxis = true,
        showLegend = true,
        legendPosition = 'right',
        xAxisLabel,
        yTickCount = 5,
        yTickFormat,
        defaultWidth = 60,
        defaultHeight = 15,
        min,
        max,
    } = config;

    const gridContext = useContext(GridItemContext);

    // 1. Calculate Total Dimensions
    // Priority: props.height > gridContext.height (if number) > defaultHeight
    const totalHeight =
        props.height ??
        (typeof gridContext?.height === 'number' ? gridContext.height : defaultHeight);

    let totalWidth = props.width;
    if (totalWidth === undefined) {
        if (gridContext?.width) {
            totalWidth = Math.max(minWidth, gridContext.width - widthOffset);
        } else {
            totalWidth = defaultWidth; // Default fallback
        }
    }

    // 2. Calculate Component Dimensions
    const yAxisWidth = showYAxis
        ? getYAxisLabelWidth({
              min,
              max,
              tickCount: yTickCount,
              tickFormat: yTickFormat ?? defaultTickFormat,
          })
        : 0;

    const effectiveXAxisHeight = showXAxis ? 1 + (xAxisLabel ? 1 : 0) : 0;

    let legendWidth = 0;
    let legendHeight = 0;

    if (showLegend) {
        if (legendPosition === 'right') {
            legendWidth = 20; // Fixed width for right legend
        } else {
            // Top or Bottom
            legendHeight = 2; // 1 line content + 1 line margin
        }
    }

    // 3. Calculate Plot Dimensions
    // Width: Total - YAxis - RightLegend - (Spacing)
    const yAxisSpacing = showYAxis ? 1 : 0;
    const legendSpacing = showLegend && legendPosition === 'right' ? 2 : 0;

    const plotWidth = Math.max(
        1,
        totalWidth - yAxisWidth - yAxisSpacing - legendWidth - legendSpacing,
    );

    const plotHeight = Math.max(
        1,
        totalHeight - heightOffset - legendHeight - effectiveXAxisHeight,
    );

    return {
        totalWidth,
        totalHeight,
        plotWidth,
        plotHeight,
        yAxisWidth,
        legendHeight,
        legendWidth,
        xAxisHeight: effectiveXAxisHeight,
    };
}

/**
 * Simplified Chart layout props interface
 * Can be directly destructured from chart component props
 */
export interface ChartLayoutProps {
    width?: number;
    height?: number;
    showAxis?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'right';
    xAxisLabel?: string;
    yAxisLabel?: string;
    yTickCount?: number;
    yTickFormat?: (value: number) => string;
    /** @deprecated Recommend wrapping chart with `<Panel>` */
    widthOffset?: number;
    /** @deprecated Recommend wrapping chart with `<Panel>` */
    heightOffset?: number;
}

/**
 * Simplified layout Hook
 *
 * Directly accepts chart props, reducing verbose code at call sites.
 *
 * @example
 * ```tsx
 * const layout = useChartLayoutSimple(props, min, max);
 * // Equivalent to original verbose call:
 * // const layout = useChartLayout(
 * //     { width: props.width, height: props.height },
 * //     { showXAxis: props.showXAxis ?? props.showAxis, ... }
 * // );
 * ```
 */
export function useChartLayoutSimple(
    props: ChartLayoutProps,
    min: number,
    max: number,
): ChartLayoutResult {
    const {
        width: propsWidth,
        height: propsHeight,
        showAxis = true,
        showXAxis,
        showYAxis,
        showLegend = true,
        legendPosition = 'right',
        xAxisLabel,
        yAxisLabel,
        yTickCount = 5,
        yTickFormat,
        widthOffset = 0,
        heightOffset = 0,
    } = props;

    // Resolve relationship between showAxis and showXAxis/showYAxis
    const renderXAxis = showXAxis ?? showAxis;
    const renderYAxis = showYAxis ?? showAxis;

    return useChartLayout(
        {
            ...(propsWidth !== undefined && { width: propsWidth }),
            ...(propsHeight !== undefined && { height: propsHeight }),
        },
        {
            widthOffset,
            heightOffset,
            showXAxis: renderXAxis,
            showYAxis: renderYAxis,
            showLegend,
            legendPosition,
            ...(xAxisLabel && { xAxisLabel }),
            ...(yAxisLabel && { yAxisLabel }),
            yTickCount,
            ...(yTickFormat && { yTickFormat }),
            min,
            max,
        },
    );
}

export interface ChartSeries {
    name: string;
    data: number[];
    color?: string;
}

export function buildSeriesInputParams(
    series?: ChartSeries[],
    data?: number[],
    seriesName?: string,
): { series?: ChartSeries[]; data?: number[]; seriesName?: string } {
    const params: { series?: ChartSeries[]; data?: number[]; seriesName?: string } = {};
    if (series !== undefined) {
        params.series = series;
    }
    if (data !== undefined) {
        params.data = data;
    }
    if (seriesName !== undefined) {
        params.seriesName = seriesName;
    }
    return params;
}

export function resolveSeriesInput(params: {
    series?: ChartSeries[];
    data?: number[];
    seriesName?: string;
}): ChartSeries[] {
    const { series, data, seriesName } = params;
    if (series && series.length > 0) {
        return series;
    }
    if (data && data.length > 0) {
        return [
            {
                name: seriesName ?? 'Series',
                data,
            },
        ];
    }
    return [];
}

export function computeSeriesExtent(series: ChartSeries[]): {
    min: number;
    max: number;
    maxLength: number;
} {
    let min = 0;
    let max = 0;
    let maxLength = 0;
    let hasValue = false;

    for (const item of series) {
        maxLength = Math.max(maxLength, item.data.length);
        for (const value of item.data) {
            if (!hasValue) {
                min = value;
                max = value;
                hasValue = true;
                continue;
            }
            min = Math.min(min, value);
            max = Math.max(max, value);
        }
    }

    if (!hasValue) {
        return { min: 0, max: 0, maxLength };
    }

    return { min, max, maxLength };
}

export function getPixelDimensions(
    renderer: Renderer,
    width: number,
    height: number,
): { pixelWidth: number; pixelHeight: number } {
    const resolution = renderer.getResolution();
    return {
        pixelWidth: width * resolution.horizontal,
        pixelHeight: height * resolution.vertical,
    };
}

export function defaultTickFormat(value: number): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    // Billion
    if (absValue >= 1_000_000_000) {
        const v = absValue / 1_000_000_000;
        return `${sign}${Number.isInteger(v) ? v : v.toFixed(1)}b`;
    }

    // Million
    if (absValue >= 1_000_000) {
        const v = absValue / 1_000_000;
        return `${sign}${Number.isInteger(v) ? v : v.toFixed(1)}m`;
    }

    // Kilo
    if (absValue >= 1_000) {
        const v = absValue / 1_000;
        return `${sign}${Number.isInteger(v) ? v : v.toFixed(1)}k`;
    }

    // Less than 1000: display as integer
    return Math.round(value).toString();
}

export function getYAxisLabelWidth(params: {
    min: number;
    max: number;
    tickCount: number;
    tickFormat?: (value: number) => string;
}): number {
    const { min, max, tickCount, tickFormat = defaultTickFormat } = params;
    if (tickCount <= 0) {
        return 0;
    }
    if (max === min) {
        return tickFormat(min).length;
    }

    const step = (max - min) / (tickCount - 1);
    let maxLength = 0;
    for (let i = 0; i < tickCount; i++) {
        const value = min + i * step;
        maxLength = Math.max(maxLength, tickFormat(value).length);
    }
    return maxLength;
}

/**
 * Compute baseline Y coordinate
 *
 * Used for AreaChart and BarChart to determine the starting point of the filled area
 */
export function computeBaselineY(params: {
    min: number;
    max: number;
    pixelHeight: number;
}): number {
    const { min, max, pixelHeight } = params;
    if (max === min) {
        return Math.round((pixelHeight - 1) / 2);
    }
    const baselineValue = min <= 0 && max >= 0 ? 0 : min > 0 ? min : max;
    return Math.round(linearScale(baselineValue, [min, max], [pixelHeight - 1, 0]));
}
