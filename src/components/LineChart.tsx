/**
 * LineChart - Basic line chart component
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
    defaultTickFormat,
    getPixelDimensions,
    useChartLayoutSimple,
} from './common/chartUtils';
import { useChartCore } from './common/useChartCore';
import { DEFAULT_RENDERER_CHAIN, useChartRenderer } from './common/useChartRenderer';

/**
 * LineChart component props
 */
export type LineChartProps = TimeSeriesChartProps;

export const LineChart: React.FC<LineChartProps> = (props) => {
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

    // 3. Draw line chart (component-specific logic)
    const coloredLines = useMemo(
        () => renderLineChartCanvas({
            renderer,
            series,
            canvasWidth,
            canvasHeight,
            min,
            max,
            colors,
        }),
        [renderer, series, canvasWidth, canvasHeight, min, max, colors],
    );

    if (coloredLines.length === 0) {
        return null;
    }

    // 4. Build AxisConfig
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

    // 5. Assemble
    return (
        <ChartContainer
            layout={layout}
            showLegend={showLegend}
            legendPosition={legendPosition}
            legendItems={legendItems}
            showXAxis={renderXAxis}
            showYAxis={renderYAxis}
            xAxisConfig={xAxisConfig}
            yAxisConfig={yAxisConfig}
        >
            {coloredLines.map((line, i) => (
                <Text key={i}>
                    {line.map((seg, j) => (
                        <Text
                            key={j}
                            {...(seg.color ? { color: seg.color } : {})}
                            {...(seg.backgroundColor
                                ? { backgroundColor: seg.backgroundColor }
                                : {})}
                        >
                            {seg.text}
                        </Text>
                    ))}
                </Text>
            ))}
        </ChartContainer>
    );
};

// ===== Internal rendering logic =====

interface RenderLineChartParams {
    renderer: ReturnType<typeof useChartRenderer>;
    series: Array<{ name: string; data: number[]; color?: string }>;
    canvasWidth: number;
    canvasHeight: number;
    min: number;
    max: number;
    colors: string[];
}

function renderLineChartCanvas({
    renderer,
    series,
    canvasWidth,
    canvasHeight,
    min,
    max,
    colors,
}: RenderLineChartParams) {
    const { pixelWidth, pixelHeight } = getPixelDimensions(renderer, canvasWidth, canvasHeight);

    if (pixelWidth <= 0 || pixelHeight <= 0 || series.length === 0) {
        return [];
    }

    const canvas = renderer.createCanvas(pixelWidth, pixelHeight);

    for (let si = 0; si < series.length; si++) {
        const s = series[si];
        if (!s) continue;

        const { data } = s;
        const color = s.color ?? colors[si] ?? 'cyan';

        if (data.length === 0) continue;

        // Calculate pixel position for each data point
        const xScale = data.length > 1 ? (pixelWidth - 1) / (data.length - 1) : 0;

        const scaleY = (value: number): number => {
            if (max === min) {
                return Math.round((pixelHeight - 1) / 2);
            }
            return Math.round(linearScale(value, [min, max], [pixelHeight - 1, 0]));
        };

        // Draw line segments
        for (let i = 0; i < data.length - 1; i++) {
            const currVal = data[i];
            const nextVal = data[i + 1];

            if (currVal === undefined || nextVal === undefined) continue;

            const x0 = Math.round(i * xScale);
            const y0 = scaleY(currVal);
            const x1 = Math.round((i + 1) * xScale);
            const y1 = scaleY(nextVal);

            renderer.drawLine(canvas, x0, y0, x1, y1, { active: true, color });
        }

        // If only one point, draw separately
        if (data.length === 1) {
            const val = data[0];
            if (val !== undefined) {
                const x = Math.round(pixelWidth / 2);
                const y = scaleY(val);
                renderer.setPixel(canvas, x, y, { active: true, color });
            }
        }
    }

    return renderer.renderCanvas(canvas, pixelWidth, pixelHeight);
}
