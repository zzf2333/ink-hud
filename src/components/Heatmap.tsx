import { Box, Text } from 'ink';
import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { createGradient } from '../utils/gradient';

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
     * Custom character (defaults to Unicode block ■)
     */
    char?: string;
}

/**
 * Heatmap - Heatmap component
 *
 * Display density or time distribution (similar to GitHub Contribution graph).
 * Use color intensity to represent value magnitude.
 */
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

export const Heatmap: React.FC<HeatmapProps> = ({ data, colors, char }) => {
    const theme = useTheme();
    const effectiveColors = colors ?? theme.heatmapGradient;
    const effectiveChar = char ?? '■';

    const { min, max } = useMemo(() => {
        const { min: minVal, max: maxVal } = findMinMax(data);
        if (minVal === Number.POSITIVE_INFINITY) return { min: 0, max: 0 };
        return { min: minVal, max: maxVal > minVal ? maxVal : minVal + 1 };
    }, [data]);

    const steps = effectiveColors.length;
    const gradient = useMemo(
        () => createGradient(effectiveColors, steps),
        [effectiveColors, steps],
    );

    return (
        <Box flexDirection="column">
            {data.map((row, rowIndex) => (
                <Box key={rowIndex} flexDirection="row">
                    {row.map((val, colIndex) => {
                        const normalized = max === min ? 0 : (val - min) / (max - min);
                        let stepIndex = Math.floor(normalized * steps);
                        if (stepIndex >= steps) stepIndex = steps - 1;

                        const colorFn = gradient[stepIndex];
                        const renderedChar = colorFn ? colorFn(effectiveChar) : effectiveChar;

                        return <Text key={`${rowIndex}-${colIndex}`}>{renderedChar} </Text>;
                    })}
                </Box>
            ))}
        </Box>
    );
};
