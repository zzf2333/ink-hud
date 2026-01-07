/**
 * ChartContainer - Unified chart layout container component
 *
 * Unified layout structure for Y-axis + Canvas + X-axis + Legend
 */

import { Box, Text } from 'ink';
import React from 'react';
import { Axis, type AxisProps } from './Axis';
import { Legend, type LegendItem } from './Legend';
import type { ChartLayoutResult } from './chartUtils';

/**
 * Axis configuration (excluding type and length fields, provided by ChartContainer)
 */
export type AxisConfig = Omit<AxisProps, 'type' | 'length'>;

/**
 * ChartContainer component props
 */
export interface ChartContainerProps {
    /** Layout calculation result */
    layout: ChartLayoutResult;

    /** Whether to show X-axis */
    showXAxis?: boolean;
    /** Whether to show Y-axis */
    showYAxis?: boolean;

    /** X-axis configuration */
    xAxisConfig?: AxisConfig;
    /** Y-axis configuration */
    yAxisConfig?: AxisConfig;

    /** Whether to show legend */
    showLegend?: boolean;
    /** Legend position */
    legendPosition?: 'top' | 'bottom' | 'right';
    /** Legend items */
    legendItems?: LegendItem[];

    /** Canvas rendering content (coloredLines) */
    children: React.ReactNode;
}

/**
 * Render Canvas content (colored lines)
 */
function renderCanvasLines(
    coloredLines: Array<Array<{ text: string; color?: string }>>,
): React.ReactNode {
    return coloredLines.map((segments, i) => (
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
    ));
}

/**
 * ChartContainer - Unified chart layout container
 *
 * Eliminate redundant JSX layout code in LineChart, AreaChart, and BarChart
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
    layout,
    showXAxis = true,
    showYAxis = true,
    xAxisConfig,
    yAxisConfig,
    showLegend = true,
    legendPosition = 'right',
    legendItems = [],
    children,
}) => {
    const { totalWidth, totalHeight, plotWidth, plotHeight, yAxisWidth } = layout;

    return (
        <Box flexDirection="column" width={totalWidth} height={totalHeight}>
            {/* Top Legend */}
            {showLegend && legendPosition === 'top' && (
                <Box marginBottom={1} marginLeft={showYAxis ? yAxisWidth + 1 : 0}>
                    <Legend items={legendItems} position="horizontal" />
                </Box>
            )}

            {/* Main Row: Y Axis + Canvas + Right Legend */}
            <Box flexDirection="row">
                {/* Y Axis */}
                {showYAxis && yAxisConfig && (
                    <Box marginRight={1} width={yAxisWidth}>
                        <Axis type="y" length={plotHeight} {...yAxisConfig} />
                    </Box>
                )}

                {/* Canvas Content */}
                <Box flexDirection="column">{children}</Box>

                {/* Right Legend */}
                {showLegend && legendPosition === 'right' && (
                    <Box marginLeft={2}>
                        <Legend items={legendItems} position="vertical" />
                    </Box>
                )}
            </Box>

            {/* X Axis */}
            {showXAxis && xAxisConfig && (
                <Box marginLeft={showYAxis ? yAxisWidth + 1 : 0}>
                    <Axis type="x" length={plotWidth} {...xAxisConfig} />
                </Box>
            )}

            {/* Bottom Legend */}
            {showLegend && legendPosition === 'bottom' && (
                <Box marginTop={1} marginLeft={showYAxis ? yAxisWidth + 1 : 0}>
                    <Legend items={legendItems} position="horizontal" />
                </Box>
            )}
        </Box>
    );
};

/**
 * Render coloredLines as React elements
 */
export { renderCanvasLines };
