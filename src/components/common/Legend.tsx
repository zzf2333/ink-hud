/**
 * Legend component
 *
 * Used to display chart legend
 */

import { Box, Text } from 'ink';
import React from 'react';

/**
 * Legend item
 */
export interface LegendItem {
    /** Legend name */
    name: string;

    /** Legend color */
    color: string;

    /** Legend symbol (default '●') */
    symbol?: string;
}

/**
 * Legend component props
 */
export interface LegendProps {
    /** Legend items array */
    items: LegendItem[];

    /** Layout direction (default 'horizontal') */
    position?: 'horizontal' | 'vertical';

    /** Overall text color (defaults to each item's own color) */
    color?: string;

    /** Gap between legend items (default 2) */
    gap?: number;
}

/**
 * Legend component
 *
 * @example
 * // Horizontal legend
 * <Legend
 *     items={[
 *         { name: 'CPU', color: 'blue', symbol: '●' },
 *         { name: 'Memory', color: 'green', symbol: '●' },
 *     ]}
 *     position="horizontal"
 * />
 *
 * // Vertical legend
 * <Legend
 *     items={[
 *         { name: 'Series 1', color: 'cyan' },
 *         { name: 'Series 2', color: 'yellow' },
 *     ]}
 *     position="vertical"
 * />
 */
export const Legend: React.FC<LegendProps> = ({
    items,
    position = 'horizontal',
    color,
    gap = 2,
}) => {
    if (items.length === 0) {
        return null;
    }

    return (
        <Box flexDirection={position === 'horizontal' ? 'row' : 'column'} gap={gap}>
            {items.map((item, i) => (
                <Box key={`legend-${i}`} gap={1}>
                    <Text color={color ?? item.color}>{item.symbol || '●'}</Text>
                    <Text {...(color && { color })}>{item.name}</Text>
                </Box>
            ))}
        </Box>
    );
};
