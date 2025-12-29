import { Box, Text } from 'ink';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';

/**
 * Character set configuration
 */
const CHAR_SETS = {
    unicode: { fill: '█', empty: '░' },
    ascii: { fill: '#', empty: '-' },
} as const;

export interface GaugeProps {
    /**
     * Current value
     */
    value: number;

    /**
     * Minimum value
     * @default 0
     */
    min?: number;

    /**
     * Maximum value
     * @default 100
     */
    max?: number;

    /**
     * Progress bar width (character count), excluding percentage text
     * @default 20
     */
    width?: number;

    /**
     * Fill color
     * @default 'green'
     */
    color?: string;

    /**
     * Unfilled character color
     * @default 'gray'
     */
    emptyColor?: string;

    /**
     * Whether to show percentage text
     * @default true
     */
    showPercent?: boolean;

    /**
     * Rendering style
     * - 'unicode': Use Unicode block characters (█░)
     * - 'ascii': Use ASCII characters (#-)
     * @default 'unicode'
     */
    variant?: 'unicode' | 'ascii';

    /**
     * Custom fill character (overrides variant setting)
     */
    fillChar?: string;

    /**
     * Custom unfilled character (overrides variant setting)
     */
    emptyChar?: string;

    /**
     * Prefix label
     */
    label?: string;
}

/**
 * Gauge - Gauge/progress bar component
 *
 * Display progress or load of a single metric.
 * Style examples:
 * - unicode: [██████░░░░] 60%
 * - ascii:   [######----] 60%
 */
export const Gauge: React.FC<GaugeProps> = ({
    value,
    min = 0,
    max = 100,
    width = 20,
    color,
    emptyColor,
    showPercent = true,
    variant = 'unicode',
    fillChar,
    emptyChar,
    label,
}) => {
    const theme = useTheme();
    const effectiveColor = color ?? theme.semantic.success;
    const effectiveEmptyColor = emptyColor ?? theme.semantic.muted;

    // Select character set based on variant
    const charSet = CHAR_SETS[variant];
    const effectiveFillChar = fillChar ?? charSet.fill;
    const effectiveEmptyChar = emptyChar ?? charSet.empty;

    const clampedValue = Math.min(Math.max(value, min), max);
    const range = max - min;
    const ratio = range === 0 ? 0 : (clampedValue - min) / range;
    const percent = Math.round(ratio * 100);

    const filledLength = Math.round(ratio * width);
    const emptyLength = width - filledLength;

    const filledStr = effectiveFillChar.repeat(filledLength);
    const emptyStr = effectiveEmptyChar.repeat(emptyLength);

    return (
        <Box flexDirection="row">
            {label && (
                <Box marginRight={1}>
                    <Text>{label}</Text>
                </Box>
            )}
            <Text color={effectiveColor}>{filledStr}</Text>
            <Text color={effectiveEmptyColor}>{emptyStr}</Text>
            {showPercent && (
                <Box marginLeft={1}>
                    <Text>{percent}%</Text>
                </Box>
            )}
        </Box>
    );
};
