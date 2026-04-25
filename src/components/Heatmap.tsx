import { Box, Text, useStdout } from 'ink';
import React, { useEffect, useMemo } from 'react';
import tinygradient from 'tinygradient';
import { detectImageProtocol, type ImageProtocol } from '../render/capabilities';
import { createRgbPng, hexToRgb } from '../render/image/png';
import { encodeKitty } from '../render/image/kitty';
import { encodeIterm2 } from '../render/image/iterm2';
import { useTheme } from '../theme/ThemeContext';
import { createGradient } from '../utils/gradient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
     * Custom character for character mode (defaults to Unicode block ■)
     */
    char?: string;

    /**
     * Rendering mode.
     * - 'auto': use image protocol if the terminal supports it, otherwise character mode
     * - 'image': force image protocol (no-op if unsupported)
     * - 'character': always use unicode block characters
     * @default 'auto'
     */
    mode?: 'auto' | 'image' | 'character';

    /**
     * Pixel size of each data cell in image mode.
     * Higher values produce sharper images at the cost of more data.
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

/**
 * Build an array of RGB triples spanning the gradient.
 * Uses tinygradient (already a dependency) for accurate colour interpolation.
 */
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
    const { stdout } = useStdout();

    // --- Shared min/max/steps ---
    const { min, max } = useMemo(() => {
        const { min: minVal, max: maxVal } = findMinMax(data);
        if (minVal === Number.POSITIVE_INFINITY) return { min: 0, max: 0 };
        return { min: minVal, max: maxVal > minVal ? maxVal : minVal + 1 };
    }, [data]);

    const steps = effectiveColors.length;

    // --- Detect image protocol ---
    const protocol: ImageProtocol | null = useMemo(() => {
        if (mode === 'character') return null;
        return detectImageProtocol();
    }, [mode]);

    const useImage = protocol !== null && mode !== 'character';

    // --- Image rendering via terminal image protocol ---
    useEffect(() => {
        if (!useImage || !protocol) return;

        const dataRows = data.length;
        const dataCols = data[0]?.length ?? 0;
        if (!dataRows || !dataCols) return;

        // Build an RGB colour palette for the gradient
        const palette = gradientRgbPalette(effectiveColors, steps);

        // Build a pixel grid: each data cell → cellPx × cellPx pixels
        // Adjacent cells share a cellPx-wide gap painted in near-black for visual separation.
        const pixelGrid: [number, number, number][][] = [];
        const GAP: [number, number, number] = [16, 16, 16]; // dark separator

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
                    // Gap column (mirrors the trailing space in character mode)
                    for (let px = 0; px < cellPx; px++) pixelRow.push(GAP);
                }
                pixelGrid.push(pixelRow);
            }
        }

        const pngBuf = createRgbPng(pixelGrid);
        // Each data column occupies 2 character cells (char + space)
        const charCols = dataCols * 2;

        const seq =
            protocol === 'kitty'
                ? encodeKitty(pngBuf, charCols, dataRows)
                : encodeIterm2(pngBuf, charCols);

        // PoC positioning: cursor up by dataRows lines, write image, cursor down.
        // Assumes Heatmap placeholder is at the bottom of the current ink frame.
        // Precise sub-component positioning will be addressed in a future iteration.
        stdout.write(`\x1b[${dataRows}A\x1b[0G${seq}\x1b[${dataRows}B`);
    }, [data, min, max, steps, effectiveColors, protocol, useImage, cellPx, stdout]);

    // --- Character rendering (or placeholder for image mode) ---

    if (useImage) {
        // Render blank placeholder rows so ink reserves the correct space.
        const placeholderWidth = (data[0]?.length ?? 0) * 2;
        return (
            <Box flexDirection="column">
                {data.map((_, i) => (
                    <Text key={i}>{' '.repeat(placeholderWidth)}</Text>
                ))}
            </Box>
        );
    }

    // Character mode — original implementation
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
