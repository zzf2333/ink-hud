/**
 * useChartCore - Chart core data processing Hook
 *
 * Integrates data processing logic shared by all chart components
 */

import { useMemo } from 'react';
import { type ColorPalette } from '../../utils/gradient';
import type { LegendItem } from './Legend';
import {
    type ChartSeries,
    buildSeriesInputParams,
    computeSeriesExtent,
    resolveSeriesColors,
    resolveSeriesInput,
} from './chartUtils';

/**
 * Chart core Hook input parameters
 */
export interface ChartCoreProps {
    /** Multi-series data */
    series?: ChartSeries[];
    /** Single-series data (simplified) */
    data?: number[];
    /** Single-series name (simplified) */
    seriesName?: string;
    /** Color array */
    colors?: string[];
    /** Color palette */
    colorPalette?: ColorPalette;
}

/**
 * Chart core Hook return value
 */
export interface ChartCoreResult {
    /** Parsed series data */
    series: ChartSeries[];
    /** Minimum data value */
    min: number;
    /** Maximum data value */
    max: number;
    /** Maximum data point length */
    maxLength: number;
    /** Series color array */
    colors: string[];
    /** Legend items */
    legendItems: LegendItem[];
}

/**
 * Chart core data processing Hook
 *
 * Integrates the following common logic:
 * - Data series parsing
 * - Data range calculation
 * - Color assignment
 * - Legend item construction
 */
export function useChartCore(props: ChartCoreProps): ChartCoreResult {
    const { series: seriesProp, data, seriesName, colors: colorsProp, colorPalette } = props;

    // 1. Parse series data
    const series = useMemo(
        () => resolveSeriesInput(buildSeriesInputParams(seriesProp, data, seriesName)),
        [seriesProp, data, seriesName],
    );

    // 2. Calculate data range
    const { min, max, maxLength } = useMemo(() => computeSeriesExtent(series), [series]);

    // 3. Assign colors
    const colors = useMemo(
        () => resolveSeriesColors(series, colorsProp, colorPalette),
        [series, colorsProp, colorPalette],
    );

    // 4. Build legend items
    const legendItems = useMemo(
        () =>
            series.map((item, i) => ({
                name: item.name,
                color: item.color ?? colors[i] ?? 'cyan',
                symbol: '●',
            })),
        [series, colors],
    );

    return {
        series,
        min,
        max,
        maxLength,
        colors,
        legendItems,
    };
}
