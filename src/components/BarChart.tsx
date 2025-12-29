/**
 * BarChart Basic bar chart component
 */

import { Text } from 'ink';
import React, { useMemo } from 'react';
import type { Renderer } from '../core/renderer';
import { linearScale } from '../utils/scale';
import {
    ChartContainer,
    type AxisConfig,
} from './common/ChartContainer';
import type { TimeSeriesChartProps } from './common/chartTypes';
import {
    type ChartSeries,
    computeBaselineY,
    defaultTickFormat,
    getPixelDimensions,
    useChartLayoutSimple,
} from './common/chartUtils';
import { useChartCore } from './common/useChartCore';
import { BAR_CHART_RENDERER_CHAIN, useChartRenderer } from './common/useChartRenderer';

// ============================================================================
// Layout Helpers (Pure Functions)
// ============================================================================

const alignDown = (val: number, alignment: number) => Math.floor(val / alignment) * alignment;

/**
 * Vertical Layout Calculation
 * X-Axis partitioning.
 */
function computeVerticalLayout(params: {
    pixelWidth: number;
    categoryCount: number;
    seriesCount: number;
    alignment: number; // Horizontal resolution (usually 1 or 2)
}): { groupWidth: number; barWidth: number; barGap: number; groupPadding: number } {
    const { pixelWidth, categoryCount, seriesCount, alignment } = params;

    // 1. Calculate max possible group width across the canvas
    const maxGroupWidth = alignDown(Math.max(alignment, Math.floor(pixelWidth / Math.max(1, categoryCount))), alignment);
    let groupWidth = maxGroupWidth;

    // Internal helper to calculate layout for a specific padding
    const calculateForPadding = (p: number) => {
        const available = groupWidth - p * 2;
        // Need at least 1 alignment unit per bar
        const minNeed = seriesCount * alignment;
        if (available < minNeed) return null;

        const gap = (available >= seriesCount * alignment + (seriesCount - 1) * alignment) ? alignment : 0;
        const totalGap = gap * (seriesCount - 1);
        const remaining = available - totalGap;

        let barWidth = Math.floor(remaining / seriesCount);
        // Ensure barWidth is aligned (even values for Block)
        barWidth = alignDown(barWidth, alignment);

        if (barWidth < alignment) return null;

        return { groupWidth, barWidth, barGap: gap, groupPadding: p };
    };

    // 2. Strategy Comparison
    // Strategy A: Standard Padding (Breathing room)
    const paddingStandard = alignment;
    const layoutStandard = calculateForPadding(paddingStandard);

    // Strategy B: Compact (Max Width)
    const layoutCompact = calculateForPadding(0);

    // Decision:
    // 1. If Standard is invalid, must use Compact.
    if (!layoutStandard) {
        return layoutCompact ?? { groupWidth, barWidth: alignment, barGap: 0, groupPadding: 0 };
    }

    // 2. If Compact is invalid (shouldn't happen if Standard is valid, but safety), use Standard.
    if (!layoutCompact) {
        return layoutStandard;
    }

    // 3. Maximize Bar Width:
    // If Compact gives us strictly WIDER bars, we sacrifice padding to get fat bars.
    // e.g. Standard: Bar=2. Compact: Bar=4. -> Choose Compact.
    if (layoutCompact.barWidth > layoutStandard.barWidth) {
        return layoutCompact;
    }

    // Otherwise prefer breathing room
    return layoutStandard;
}

/**
 * Horizontal Layout Calculation
 * Y-Axis partitioning.
 * Critical for Block Rendering (Alignment 8).
 */
function computeHorizontalLayout(params: {
    pixelHeight: number;
    categoryCount: number;
    seriesCount: number;
    alignment: number; // Vertical resolution (usually 8 for Block, 3 for Ascii, 4 for Braille)
}): { groupHeight: number; barHeight: number; barGap: number; groupPadding: number } {
    const { pixelHeight, categoryCount, seriesCount, alignment } = params;

    // 1. Calculate max possible height per category
    const maxGroupHeight = alignDown(Math.max(alignment, Math.floor(pixelHeight / Math.max(1, categoryCount))), alignment);

    // 2. Strict Block Logic (High Alignment)
    if (alignment >= 4) {
        // With high alignment (e.g. 8px), we have limited vertical canvas.
        // Preventing gaps is priority #1 to avoid seeing "scanlines".

        // Calculate the absolute minimum stack height needed for one group
        // assuming minimum bar height (1 alignment unit) and NO gaps.
        const stackHeight = seriesCount * alignment;

        // Case A: The assigned group space is just enough or barely tight.
        // We force Tight Layout: GroupHeight = StackHeight.
        // This eliminates "Slack" (unused pixels) inside the group logic, pushing all slack to the end of the chart.
        const groupHeight = Math.max(alignment, stackHeight);

        return {
            groupHeight: groupHeight, // Strictly tight
            barHeight: alignment,     // Min thickness (1 block char)
            barGap: 0,               // No gaps
            groupPadding: 0          // No padding
        };
    }

    // 3. Standard Logic (Low Alignment, e.g. Ascii/Braille or purely pixel-based)
    // Similar to vertical logic: try to add padding/gaps if space allows.
    let padding = alignment;

    // ... logic similar to vertical but simpler ...
    // For simplicity, just use a compact strategy for horizontal to maximize label readability space usually
    // But here we are just drawing bars.

    // For non-block renderers, we can try to be nice.
    const available = maxGroupHeight - padding * 2;
    if (available > seriesCount * alignment * 1.5) {
        // Enough space for padding
        const gap = alignment;
        const barHeight = alignDown(Math.floor((available - gap * (seriesCount - 1)) / seriesCount), alignment);
        return { groupHeight: maxGroupHeight, barHeight, barGap: gap, groupPadding: padding };
    }

    // Compact fallback
    const availableCompact = maxGroupHeight;
    const barHeightCompact = alignDown(Math.floor(availableCompact / seriesCount), alignment);
    return { groupHeight: maxGroupHeight, barHeight: barHeightCompact, barGap: 0, groupPadding: 0 };
}


// ============================================================================
// Renderers
// ============================================================================

function renderVertical(params: {
    renderer: Renderer;
    series: ChartSeries[];
    width: number;
    height: number;
    min: number;
    max: number;
    maxLength: number;
    colors: string[];
}) {
    const { renderer, series, width, height, min, max, maxLength, colors } = params;
    const { pixelWidth, pixelHeight } = getPixelDimensions(renderer, width, height);
    const canvas = renderer.createCanvas(pixelWidth, pixelHeight);

    const resolution = renderer.getResolution();
    const alignment = resolution.horizontal;

    // Layout
    const { groupWidth, barWidth, barGap, groupPadding } = computeVerticalLayout({
        pixelWidth,
        categoryCount: maxLength,
        seriesCount: series.length,
        alignment
    });

    const baselineY = computeBaselineY({ min, max, pixelHeight });
    const scaleValue = (val: number) => {
        if (max === min) return Math.round((pixelHeight - 1) / 2);
        return Math.round(linearScale(val, [min, max], [pixelHeight - 1, 0]));
    };

    // Render
    for (let i = 0; i < maxLength; i++) {
        const groupLeft = i * groupWidth + groupPadding;
        for (let j = 0; j < series.length; j++) {
            const val = series[j]?.data[i] ?? 0;
            const yVal = scaleValue(val);
            const x = groupLeft + j * (barWidth + barGap);
            const xEnd = Math.min(pixelWidth - 1, x + barWidth - 1);

            const yStart = Math.min(yVal, baselineY);
            const yEnd = Math.max(yVal, baselineY);
            const color = colors[j];

            for (let yy = yStart; yy <= yEnd; yy++) {
                for (let xx = x; xx <= xEnd; xx++) {
                    renderer.setPixel(canvas, xx, yy, { active: true, ...(color ? { color } : {}) });
                }
            }
        }
    }
    return renderer.renderCanvas(canvas, pixelWidth, pixelHeight);
}

function renderHorizontal(params: {
    renderer: Renderer;
    series: ChartSeries[];
    width: number;
    height: number;
    min: number;
    max: number;
    maxLength: number;
    colors: string[];
}) {
    const { renderer, series, width, height, min, max, maxLength, colors } = params;

    const resolution = renderer.getResolution();

    const pixelWidth = width * resolution.horizontal;
    const pixelHeight = height * resolution.vertical;
    const canvas = renderer.createCanvas(pixelWidth, pixelHeight);

    // Vertical alignment (Thickness of horizontal bar)
    const alignment = resolution.vertical;

    // Layout
    const { groupHeight, barHeight, barGap, groupPadding } = computeHorizontalLayout({
        pixelHeight,
        categoryCount: maxLength,
        seriesCount: series.length,
        alignment
    });

    // Scale X
    const scaleValue = (val: number) => {
        if (max === min) return Math.round((pixelWidth - 1) / 2);
        return Math.round(linearScale(val, [min, max], [0, pixelWidth - 1]));
    };

    // Baseline X
    let baselineVal = 0;
    if (min > 0) baselineVal = min;
    else if (max < 0) baselineVal = max;
    const baselineX = scaleValue(baselineVal);

    // Render
    // Note: We use the *calculated* groupHeight for rendering positions strictly.
    // This allows the "Tight Layout" to act effectively.
    for (let i = 0; i < maxLength; i++) {
        const groupTop = i * groupHeight + groupPadding;
        for (let j = 0; j < series.length; j++) {
            const val = series[j]?.data[i] ?? 0;
            const xVal = scaleValue(val);

            const y = groupTop + j * (barHeight + barGap);
            const yEnd = Math.min(pixelHeight - 1, y + barHeight - 1); // Clamp to canvas

            // Check if we are checking out of bounds (which safe tightening prevents, but for safety)
            if (y >= pixelHeight) continue;

            const xStart = Math.min(xVal, baselineX);
            const xEndFill = Math.max(xVal, baselineX);
            const color = colors[j];

            for (let yy = y; yy <= yEnd; yy++) {
                for (let xx = xStart; xx <= xEndFill; xx++) {
                    renderer.setPixel(canvas, xx, yy, { active: true, ...(color ? { color } : {}) });
                }
            }
        }
    }

    return renderer.renderCanvas(canvas, pixelWidth, pixelHeight);
}


// ============================================================================
// Main Component
// ============================================================================

/**
 * BarChart component props
 */
export type BarChartProps = TimeSeriesChartProps & {
    /** Orientation (default 'vertical') */
    orientation?: 'vertical' | 'horizontal';
};

export const BarChart: React.FC<BarChartProps> = (props) => {
    const {
        showLegend = true,
        showAxis = true,
        showXAxis,
        showYAxis,
        legendPosition = 'right',
        orientation = 'vertical',
        xAxisLabel,
        yAxisLabel,
        xTickCount = 5,
        yTickCount = 5,
        xTickFormat,
        yTickFormat,
        rendererChain = BAR_CHART_RENDERER_CHAIN,
        xIntegerScale,
        yIntegerScale,
    } = props;

    const renderXAxis = showXAxis ?? showAxis;
    const renderYAxis = showYAxis ?? showAxis;

    // 1. Core Data
    const { series, min, max, maxLength, colors, legendItems } = useChartCore(props);
    const renderer = useChartRenderer(props, rendererChain);

    // 2. Layout
    const layout = useChartLayoutSimple(props, min, max);
    const { plotWidth: canvasWidth, plotHeight: canvasHeight } = layout;

    // 3. Render Chart Lines
    const coloredLines = useMemo(() => {
        if (series.length === 0 || maxLength === 0) return [];

        if (orientation === 'horizontal') {
            return renderHorizontal({
                renderer, series, width: canvasWidth, height: canvasHeight, min, max, maxLength, colors
            });
        }
        return renderVertical({
            renderer, series, width: canvasWidth, height: canvasHeight, min, max, maxLength, colors
        });
    }, [renderer, series, canvasWidth, canvasHeight, min, max, maxLength, colors, orientation]);

    if (coloredLines.length === 0) return null;

    // 4. Wrapped Result
    const yAxisConfig: AxisConfig = {
        min,
        max,
        tickCount: yTickCount,
        tickFormat: yTickFormat ?? defaultTickFormat,
        ...(yIntegerScale !== undefined && { integerScale: yIntegerScale }),
        ...(yAxisLabel ? { label: yAxisLabel } : {}),
    };

    const xAxisConfig: AxisConfig = {
        min: 0,
        max: Math.max(0, maxLength - 1),
        tickCount: xTickCount,
        tickFormat: xTickFormat ?? defaultTickFormat,
        integerScale: xIntegerScale ?? true,
        ...(xAxisLabel ? { label: xAxisLabel } : {}),
    };

    return (
        <ChartContainer
            layout={layout}
            showXAxis={renderXAxis}
            showYAxis={renderYAxis}
            xAxisConfig={xAxisConfig}
            yAxisConfig={yAxisConfig}
            showLegend={showLegend}
            legendPosition={legendPosition}
            legendItems={legendItems}
        >
            {coloredLines.map((segments, i) => (
                <Text key={`chart-line-${i}`}>
                    {segments.map((segment, j) => (
                        <Text
                            key={`seg-${i}-${j}`}
                            {...(segment.color ? { color: segment.color } : {})}
                            {...(segment.backgroundColor
                                ? { backgroundColor: segment.backgroundColor }
                                : {})}
                        >
                            {segment.text}
                        </Text>
                    ))}
                </Text>
            ))}
        </ChartContainer>
    );
};
