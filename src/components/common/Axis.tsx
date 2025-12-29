/**
 * Coordinate axis component
 *
 * Used for X-axis and Y-axis display in charts
 */

import { Box, Text } from 'ink';
import React, { useMemo } from 'react';
import { defaultTickFormat } from './chartUtils';

/**
 * Coordinate axis component props
 */
export interface AxisProps {
    /** Axis type */
    type: 'x' | 'y';

    /** Minimum data value */
    min: number;

    /** Maximum data value */
    max: number;

    /** Tick count (default 5) */
    tickCount?: number;

    /** Tick formatter function */
    tickFormat?: (value: number) => string;

    /** Axis label */
    label?: string;

    /** Axis length (character count) */
    length: number;

    /** Text color (default 'gray') */
    color?: string;

    /** Whether to show grid lines (default false) */
    showGrid?: boolean;

    /** Whether to force ticks to be integers (default false) */
    integerScale?: boolean;
}

/**
 * Coordinate axis component
 *
 * @example
 * // X-axis
 * <Axis type="x" min={0} max={100} length={50} label="Time" />
 *
 * // Y-axis
 * <Axis type="y" min={0} max={100} length={10} label="Value" />
 */
export const Axis: React.FC<AxisProps> = ({
    type,
    min,
    max,
    tickCount = 5,
    tickFormat = defaultTickFormat,
    label,
    length,
    color = 'gray',
    showGrid: _showGrid = false,
    integerScale = false,
}) => {
    // Calculate tick values
    const ticks = useMemo(() => {
        if (tickCount <= 0) {
            return [];
        }

        // If max equals min, display only one tick
        if (max === min) {
            return [{ value: min, position: 0 }];
        }

        let effectiveTickCount = tickCount;
        let step = (max - min) / (tickCount - 1);

        if (integerScale) {
            // Simple integer adaptation logic: if step isn't an integer, try adjusting tickCount
            const range = max - min;
            if (range < tickCount - 1) {
                // Range is too small for many ticks, reduce tick count
                effectiveTickCount = range + 1;
                step = 1;
            } else {
                // Force step to be integer? Or allow non-integer step but approximate values via Math.round?
                // Users typically want to see evenly spaced integers.
                // simple Math.round can lead to uneven distribution (0, 3.5->4, 7... => 0 4 7 11 14).
                // Here 0-4=4, 4-7=3, 7-11=4... unequal spacing.
                // Better approach is to find step that divides range evenly, but this may change tickCount.
                // Here we use simple Math.round strategy, prioritizing display of integers.
            }
        }

        return Array.from({ length: effectiveTickCount }, (_, i) => {
            let value = min + i * step;
            if (integerScale) {
                value = Math.round(value);
            }

            // position represents distance from start (0).
            const position = ((value - min) / (max - min)) * length;
            return { value, position };
        });
    }, [min, max, tickCount, length, integerScale]);

    // X-axis: horizontal layout
    if (type === 'x') {
        // Construct a single line of labels with carefully calculated spacing
        const xConfig = (() => {
            let previousEnd = 0;
            const elements: React.ReactNode[] = [];

            ticks.forEach((tick, i) => {
                const tickLabel = tickFormat(tick.value);
                const labelWidth = tickLabel.length;
                // Center the tick: tick.position is the center.
                // Start of label = tick.position - labelWidth / 2.
                // Ensure we don't overlap or go negative relative to previous.
                const intendedStart = Math.floor(tick.position - labelWidth / 2);
                const actualStart = Math.max(previousEnd, intendedStart);
                const spaces = Math.max(0, actualStart - previousEnd);

                if (spaces > 0) {
                    elements.push(<Text key={`space-${i}`}>{' '.repeat(spaces)}</Text>);
                }

                elements.push(
                    <Text key={`tick-${i}`} color={color} wrap="truncate">
                        {tickLabel}
                    </Text>,
                );

                previousEnd = actualStart + labelWidth;
            });

            return elements;
        })();

        return (
            <Box flexDirection="column">
                <Box flexDirection="row">{xConfig}</Box>
                {/* Axis label (centered) */}
                {label && (
                    <Box justifyContent="center" marginTop={0}>
                        {/* Centering label naively */}
                        <Text color={color} dimColor>
                            {label}
                        </Text>
                    </Box>
                )}
            </Box>
        );
    }

    // Y-axis: vertical layout
    // We need to distribute ticks from TOP to BOTTOM.
    // Ticks array is Min -> Max.
    // Render: Max (Top) -> Min (Bottom).
    return (
        <Box
            flexDirection="column"
            alignItems="flex-end"
            height={length}
            justifyContent="space-between"
        >
            {ticks
                .slice()
                .reverse() // Max to Min
                .map((tick, i) => (
                    <Box key={`tick-${i}`}>
                        <Text color={color} wrap="truncate">
                            {tickFormat(tick.value)}
                        </Text>
                    </Box>
                ))}

            {/* Axis label */}
            {/* If we want the label, it should be outside the height-constrained box or handled differently. */}
            {/* Current implementation put it inside the column, which would steal space. Move it out? */}
            {/* Actually, Y-Axis label usually goes to the left or top. Vertical text is hard. */}
            {/* Let's keep it simple: Ignore label inside the tick distribution box. */}
        </Box>
    );
};
