import { Box, Text } from 'ink';
import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { createGradient } from '../utils/gradient';

/**
 * Character set configuration
 */
const CHAR_SETS = {
    unicode: '■',
    ascii: '#',
} as const;

export interface HeatmapProps {
    /**
     * Data matrix (2D array)
     * e.g. rows x cols
     */
    data: number[][];

    /**
     * Color gradient (from low to high)
     * Defaults to theme's heatmapGradient
     */
    colors?: string[];

    /**
     * Empty/zero value color (if not handled in gradient)
     */
    emptyColor?: string;

    /**
     * Rendering style
     * - 'unicode': Use Unicode Blocks character (■)
     * - 'ascii': Use ASCII characters (#)
     * @default 'unicode'
     */
    variant?: 'unicode' | 'ascii';

    /**
     * Custom character (overrides variant setting)
     */
    char?: string;
}

/**
 * Heatmap - Heatmap component
 *
 * Display density or time distribution (similar to GitHub Contribution graph).
 * Use color intensity to represent value magnitude.
 */
// Helper to find min/max
const findMinMax = (data: number[][]) => {
    let minVal = Number.POSITIVE_INFINITY;
    let maxVal = Number.NEGATIVE_INFINITY;

    for (const row of data) {
        for (const val of row) {
            if (val < minVal) minVal = val;
            if (val > maxVal) maxVal = val;
        }
    }
    return { min: minVal, max: maxVal };
};

export const Heatmap: React.FC<HeatmapProps> = ({
    data,
    colors,
    variant = 'unicode',
    char,
}) => {
    const theme = useTheme();
    const effectiveColors = colors ?? theme.heatmapGradient;

    // Select character based on variant
    const effectiveChar = char ?? CHAR_SETS[variant];

    // 1. Compute min/max
    const { min, max } = useMemo(() => {
        const { min: minVal, max: maxVal } = findMinMax(data);
        if (minVal === Number.POSITIVE_INFINITY) return { min: 0, max: 0 };
        return { min: minVal, max: maxVal > minVal ? maxVal : minVal + 1 };
    }, [data]);

    // 2. Create gradient function
    // We map 0..1 to gradient steps.
    const steps = effectiveColors.length;
    const gradient = useMemo(() => createGradient(effectiveColors, steps), [effectiveColors, steps]);

    // 3. Render
    return (
        <Box flexDirection="column">
            {data.map((row, rowIndex) => (
                <Box key={rowIndex} flexDirection="row">
                    {row.map((val, colIndex) => {
                        // Normalize value to 0..1
                        const normalized = max === min ? 0 : (val - min) / (max - min);
                        // Map to step index 0..(steps-1)
                        // Using linear mapping
                        let stepIndex = Math.floor(normalized * steps);
                        if (stepIndex >= steps) stepIndex = steps - 1; // clamp max (when val == max)

                        const colorFn = gradient[stepIndex];
                        // If colorFn is missing (shouldn't happen), fallback to last color or text
                        const renderedChar = colorFn ? colorFn(effectiveChar) : effectiveChar;

                        return <Text key={`${rowIndex}-${colIndex}`}>{renderedChar} </Text>;
                    })}
                </Box>
            ))}
        </Box>
    );
};
