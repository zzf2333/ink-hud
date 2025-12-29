/**
 * Sparkline - Mini trend chart component
 */

import { Text } from 'ink';
import React, { useContext, useMemo } from 'react';
import { lttb } from '../utils/downsampling';
import { GridItemContext } from './Grid';

/**
 * Unicode block characters for sparkline (levels 1-8)
 * U+2581 to U+2588
 */
const SPARK_LEVELS_BLOCK = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/**
 * Braille characters for sparkline (progressive fill)
 */
const SPARK_LEVELS_BRAILLE = ['⠀', '⡀', '⣀', '⣄', '⣤', '⣦', '⣶', '⣷', '⣿'];

/**
 * ASCII characters for sparkline (density map)
 */
const SPARK_LEVELS_ASCII = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];

export interface SparklineProps {
    /** Array of data points */
    data: number[];

    /**
     * Target width (character count)
     * If number of data points exceeds width, will automatically use LTTB algorithm for downsampling
     * If not provided, width will equal the number of data points
     */
    width?: number;

    /** Minimum value (default: calculation from data) */
    min?: number;

    /** Maximum value (default: calculation from data) */
    max?: number;

    /** Color */
    color?: string;

    /** Rendering style (default: 'block') */
    variant?: 'block' | 'braille' | 'ascii';
}

export const Sparkline: React.FC<SparklineProps> = ({
    data,
    width: propsWidth,
    min: userMin,
    max: userMax,
    color,
    variant = 'block',
}) => {
    // Get width from Grid context
    const gridContext = useContext(GridItemContext);
    const effectiveWidth = propsWidth ?? gridContext?.width;

    const text = useMemo(() => {
        if (!data || data.length === 0) return '';

        // If width limit exists and data points exceed width, perform downsampling
        let processedData = data;
        if (effectiveWidth && data.length > effectiveWidth) {
            processedData = lttb(data, effectiveWidth);
        }

        const min = userMin ?? Math.min(...processedData);
        let max = userMax ?? Math.max(...processedData);

        // Avoid division by zero if all values are equal
        if (max === min) {
            max = min + 1;
        }

        const levels =
            variant === 'braille'
                ? SPARK_LEVELS_BRAILLE
                : variant === 'ascii'
                  ? SPARK_LEVELS_ASCII
                  : SPARK_LEVELS_BLOCK;

        return processedData
            .map((v) => {
                // Clamping
                const value = Math.max(min, Math.min(max, v));

                // Map to 0..levels.length-1 range
                const normalized = (value - min) / (max - min);
                const index = Math.round(normalized * (levels.length - 1));

                return levels[index];
            })
            .join('');
    }, [data, effectiveWidth, userMin, userMax, variant]);

    return <Text {...(color ? { color } : {})}>{text}</Text>;
};
