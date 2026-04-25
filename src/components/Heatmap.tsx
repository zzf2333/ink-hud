import { Box, Text, useStdout } from 'ink';
import React, { useEffect, useMemo, useRef } from 'react';
import tinygradient from 'tinygradient';
import { detectImageProtocol, type ImageProtocol } from '../render/capabilities';
import { createRgbPng, hexToRgb } from '../render/image/png';
import { encodeKittyUpload, encodeKittyPlaceholders, encodeKittyDelete } from '../render/image/kitty';
import { encodeIterm2 } from '../render/image/iterm2';
import { useTheme } from '../theme/ThemeContext';
import { createGradient } from '../utils/gradient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeatmapProps {
    /**
     * Data matrix (2D array), rows × cols
     */
    data: number[][];

    /**
     * Color gradient (from low to high).
     * Defaults to theme's heatmapGradient.
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

/** Stable counter for generating unique image IDs across component instances. */
let nextImageId = 1;

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

    // Stable image ID for this component instance (Kitty placeholder mode)
    const imageIdRef = useRef<number>(0);
    if (imageIdRef.current === 0) {
        imageIdRef.current = nextImageId++;
    }
    const imageId = imageIdRef.current;

    // --- Shared min/max ---
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

    // --- Build pixel grid (shared between kitty and iterm2 paths) ---
    const pngBuf = useMemo(() => {
        if (!useImage) return null;

        const dataRows = data.length;
        const dataCols = data[0]?.length ?? 0;
        if (!dataRows || !dataCols) return null;

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
                    for (let px = 0; px < cellPx; px++) pixelRow.push(GAP);
                }
                pixelGrid.push(pixelRow);
            }
        }

        return createRgbPng(pixelGrid);
    }, [data, min, max, steps, effectiveColors, cellPx, useImage]);

    // --- Kitty: upload image on data change, clean up on unmount ---
    useEffect(() => {
        if (protocol !== 'kitty' || !pngBuf) return;

        const dataRows = data.length;
        const dataCols = data[0]?.length ?? 0;
        if (!dataRows || !dataCols) return;

        const charCols = dataCols * 2;
        const uploadSeq = encodeKittyUpload(pngBuf, charCols, dataRows, imageId);
        stdout.write(uploadSeq);

        return () => {
            stdout.write(encodeKittyDelete(imageId));
        };
    }, [pngBuf, protocol, imageId, data, stdout]);

    // --- iTerm2: cursor-up write on data change ---
    useEffect(() => {
        if (protocol !== 'iterm2' || !pngBuf) return;

        const dataRows = data.length;
        const dataCols = data[0]?.length ?? 0;
        if (!dataRows || !dataCols) return;

        const charCols = dataCols * 2;
        const seq = encodeIterm2(pngBuf, charCols);
        stdout.write(`\x1b[${dataRows}A\x1b[0G${seq}\x1b[${dataRows}B`);
    }, [pngBuf, protocol, data, stdout]);

    // --- Kitty placeholder rendering ---
    if (protocol === 'kitty' && useImage) {
        const dataRows = data.length;
        const dataCols = data[0]?.length ?? 0;
        if (!dataRows || !dataCols) return null;

        const charCols = dataCols * 2;
        const placeholderText = encodeKittyPlaceholders(charCols, dataRows, imageId);

        // Split into lines so ink can measure height correctly
        const lines = placeholderText.split('\n');
        return (
            <Box flexDirection="column">
                {lines.map((line, i) => (
                    <Text key={i}>{line}</Text>
                ))}
            </Box>
        );
    }

    // --- iTerm2 placeholder (blank rows; image written via cursor-up in useEffect) ---
    if (protocol === 'iterm2' && useImage) {
        const placeholderWidth = (data[0]?.length ?? 0) * 2;
        return (
            <Box flexDirection="column">
                {data.map((_, i) => (
                    <Text key={i}>{' '.repeat(placeholderWidth)}</Text>
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
