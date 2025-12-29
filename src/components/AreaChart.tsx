/**
 * AreaChart - Basic area chart component
 */

import { Text } from 'ink';
import React, { useMemo } from 'react';
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
import { DEFAULT_RENDERER_CHAIN, useChartRenderer } from './common/useChartRenderer';

/**
 * AreaChart component props
 */
export type AreaChartProps = TimeSeriesChartProps;

/**
 * Render area chart drawing logic
 */
function renderAreaChartCanvas(params: {
    renderer: ReturnType<typeof useChartRenderer>;
    series: ChartSeries[];
    canvasWidth: number;
    canvasHeight: number;
    min: number;
    max: number;
    maxLength: number;
    colors: string[];
}): Array<Array<{ text: string; color?: string }>> {
    const { renderer, series, canvasWidth, canvasHeight, min, max, maxLength, colors } = params;

    if (series.length === 0 || maxLength === 0) {
        return [];
    }

    const { pixelWidth, pixelHeight } = getPixelDimensions(renderer, canvasWidth, canvasHeight);
    const canvas = renderer.createCanvas(pixelWidth, pixelHeight);
    const baselineY = computeBaselineY({ min, max, pixelHeight });
    const xStep = maxLength > 1 ? (pixelWidth - 1) / (maxLength - 1) : 0;

    const scaleValue = (value: number): number => {
        if (max === min) {
            return Math.round((pixelHeight - 1) / 2);
        }
        return Math.round(linearScale(value, [min, max], [pixelHeight - 1, 0]));
    };

    // Sort series by max value (descending) to draw largest areas first (background)
    const sortedData = series
        .map((s, i) => {
            const maxVal = Math.max(...s.data);
            return { series: s, color: colors[i], maxVal };
        })
        .sort((a, b) => b.maxVal - a.maxVal);

    sortedData.forEach(({ series: item, color }) => {
        let prevPoint: { x: number; y: number } | null = null;

        item.data.forEach((value, idx) => {
            const point = { x: Math.round(idx * xStep), y: scaleValue(value) };

            if (prevPoint) {
                const startX = Math.min(prevPoint.x, point.x);
                const endX = Math.max(prevPoint.x, point.x);

                for (let px = startX; px <= endX; px++) {
                    const t = endX === startX ? 0 : (px - prevPoint.x) / (point.x - prevPoint.x);
                    const py = Math.floor(prevPoint.y + (point.y - prevPoint.y) * t);

                    const fillStart = Math.min(py, baselineY);
                    const fillEnd = Math.max(py, baselineY);

                    for (let fy = fillStart; fy <= fillEnd; fy++) {
                        renderer.setPixel(canvas, px, fy, { active: true, ...(color ? { color } : {}) });
                    }
                }
                renderer.drawLine(canvas, prevPoint.x, prevPoint.y, point.x, point.y, { active: true, ...(color ? { color } : {}) });
            } else {
                const fillStart = Math.min(point.y, baselineY);
                const fillEnd = Math.max(point.y, baselineY);
                for (let fy = fillStart; fy <= fillEnd; fy++) {
                    renderer.setPixel(canvas, point.x, fy, { active: true, ...(color ? { color } : {}) });
                }
            }
            prevPoint = point;
        });
    });

    return renderer.renderCanvas(canvas, pixelWidth, pixelHeight);
}

export const AreaChart: React.FC<AreaChartProps> = (props) => {
    const {
        showLegend = true,
        showAxis = true,
        showXAxis,
        showYAxis,
        legendPosition = 'right',
        xAxisLabel,
        yAxisLabel,
        xTickCount = 5,
        yTickCount = 5,
        xTickFormat,
        yTickFormat,
        rendererChain = DEFAULT_RENDERER_CHAIN,
        xIntegerScale = true,
        yIntegerScale = false,
    } = props;

    const renderXAxis = showXAxis ?? showAxis;
    const renderYAxis = showYAxis ?? showAxis;

    // 1. Use common Hooks
    const { series, min, max, maxLength, colors, legendItems } = useChartCore(props);
    const renderer = useChartRenderer(props, rendererChain);

    // 2. Layout calculation (use simplified API)
    const layout = useChartLayoutSimple(props, min, max);

    const { plotWidth: canvasWidth, plotHeight: canvasHeight } = layout;

    // 3. Draw area chart (component-specific logic)
    const coloredLines = useMemo(
        () => renderAreaChartCanvas({
            renderer,
            series,
            canvasWidth,
            canvasHeight,
            min,
            max,
            maxLength,
            colors,
        }),
        [renderer, series, canvasWidth, canvasHeight, min, max, maxLength, colors],
    );

    if (coloredLines.length === 0) {
        return null;
    }

    // 4. Use unified container rendering
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
        ...(xIntegerScale !== undefined && { integerScale: xIntegerScale }),
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
                    {segments.map((segment, j) =>
                        segment.color ? (
                            <Text key={`seg-${i}-${j}`} color={segment.color}>
                                {segment.text}
                            </Text>
                        ) : (
                            <Text key={`seg-${i}-${j}`}>{segment.text}</Text>
                        ),
                    )}
                </Text>
            ))}
        </ChartContainer>
    );
};
