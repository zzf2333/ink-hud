import { Box, Text } from 'ink';
import React, { useMemo } from 'react';
import tinygradient from 'tinygradient';
import { createRgbPng, hexToRgb } from '../render/image/png';
import { useTheme } from '../theme/ThemeContext';
import { createGradient } from '../utils/gradient';
import { useImageProtocol } from '../hooks/useImageProtocol';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeatmapProps {
    /** Data matrix (2D array), rows × cols */
    data: number[][];

    /**
     * Color gradient (from low to high).
     * Defaults to theme's heatmapGradient.
     */
    colors?: string[];

    /** Custom character for character mode (defaults to Unicode block ■) */
    char?: string;

    /**
     * Rendering mode.
     * - 'auto': use image protocol if supported, otherwise character mode
     * - 'image': force image protocol (no-op if unsupported)
     * - 'character': always use unicode block characters
     * @default 'auto'
     */
    mode?: 'auto' | 'image' | 'character';

    /**
     * Pixel size of each data cell in image mode.
     * @default 8
     */
    cellPx?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findMinMax(data: number[][]): { min: number; max: number } {
    let minVal = Number.POSITIVE_INFINITY;
    let maxVal = Number.NEGATIVE_INFINITY;
    for (const row of data) {
        for (const val of row) {
            if (val < minVal) minVal = val;
            if (val > maxVal) maxVal = val;
        }
    }
    return { min: minVal, max: maxVal };
}

function gradientRgbPalette(
    colors: string[],
    steps: number,
): [number, number, number][] {
    if (steps === 0) return [];
    if (colors.length === 0) return Array(steps).fill([128, 128, 128] as [number, number, number]);
    if (colors.length === 1) {
        const rgb = hexToRgb(colors[0] ?? '#808080');
        return Array(steps).fill(rgb);
    }
    const g = tinygradient(colors);
    return g.rgb(steps).map((c) => hexToRgb('#' + c.toHex()));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Heatmap: React.FC<HeatmapProps> = ({
    data,
    colors,
    char,
    mode = 'auto',
    cellPx = 8,
}) => {
    const theme = useTheme();
    const effectiveColors = colors ?? theme.heatmapGradient;
    const effectiveChar = char ?? '■';

    const dataRows = data.length;
    const dataCols = data[0]?.length ?? 0;

    // --- Shared min/max ---
    const { min, max } = useMemo(() => {
        const { min: minVal, max: maxVal } = findMinMax(data);
        if (minVal === Number.POSITIVE_INFINITY) return { min: 0, max: 0 };
        return { min: minVal, max: maxVal > minVal ? maxVal : minVal + 1 };
    }, [data]);

    const steps = effectiveColors.length;

    // --- Build PNG (skipped in character mode or when data is empty) ---
    const pngBuf = useMemo(() => {
        if (mode === 'character' || !dataRows || !dataCols) return null;

        const palette = gradientRgbPalette(effectiveColors, steps);
        const pixelGrid: [number, number, number][][] = [];
        const GAP: [number, number, number] = [16, 16, 16];

        for (let row = 0; row < dataRows; row++) {
            for (let py = 0; py < cellPx; py++) {
                const pixelRow: [number, number, number][] = [];
                for (let col = 0; col < dataCols; col++) {
                    const val = data[row]?.[col] ?? 0;
                    const normalized = max === min ? 0 : (val - min) / (max - min);
                    let si = Math.floor(normalized * steps);
                    if (si >= steps) si = steps - 1;
                    const rgb = palette[si] ?? GAP;
                    for (let px = 0; px < cellPx; px++) pixelRow.push(rgb);
                    // Gap column mirrors the trailing space in character mode
                    for (let px = 0; px < cellPx; px++) pixelRow.push(GAP);
                }
                pixelGrid.push(pixelRow);
            }
        }

        return createRgbPng(pixelGrid);
    }, [data, min, max, steps, effectiveColors, cellPx, mode, dataRows, dataCols]);

    // --- Image protocol: upload, effects, and placeholder data ---
    // charCols = dataCols Kitty cells, each 2 terminal cols wide (trailingSpace=true)
    const { kittyLines, iterm2Cols } = useImageProtocol({
        mode,
        charCols: dataCols,
        charRows: dataRows,
        pngBuf,
        trailingSpace: true,
    });

    // --- Kitty placeholder ---
    if (kittyLines !== null) {
        return (
            <Box flexDirection="column">
                {kittyLines.map((line, i) => (
                    <Text key={i}>{line}</Text>
                ))}
            </Box>
        );
    }

    // --- iTerm2 placeholder (blank rows; image written via cursor-up in hook) ---
    if (iterm2Cols !== null) {
        return (
            <Box flexDirection="column">
                {data.map((_, i) => (
                    <Text key={i}>{' '.repeat(iterm2Cols)}</Text>
                ))}
            </Box>
        );
    }

    // --- Character mode ---
    const gradient = createGradient(effectiveColors, steps);

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
