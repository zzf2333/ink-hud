/**
 * Sparkline - Mini trend chart component
 */

import { Box, Text, useStdout } from 'ink';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { lttb } from '../utils/downsampling';
import { detectImageProtocol, type ImageProtocol } from '../render/capabilities';
import { gradientColorFn, buildSparklinePixelGrid } from '../render/image/drawing';
import { createRgbPng } from '../render/image/png';
import { encodeKittyUpload, encodeKittyPlaceholders, encodeKittyDelete } from '../render/image/kitty';
import { encodeIterm2 } from '../render/image/iterm2';
import { useTheme } from '../theme/ThemeContext';
import { GridItemContext } from './Grid';

const SPARK_LEVELS_BLOCK = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
const SPARK_LEVELS_BRAILLE = ['⠀', '⡀', '⣀', '⣄', '⣤', '⣦', '⣶', '⣷', '⣿'];

export interface SparklineProps {
    /** Array of data points */
    data: number[];

    /**
     * Target width in character columns.
     * If data.length exceeds width, LTTB downsampling is applied.
     * Defaults to data.length.
     */
    width?: number;

    /** Minimum value (default: derived from data) */
    min?: number;

    /** Maximum value (default: derived from data) */
    max?: number;

    /** Single solid color for character mode (and image mode when colors is not set) */
    color?: string;

    /**
     * Rendering style for character mode.
     * Ignored in image mode.
     * @default 'block'
     */
    variant?: 'block' | 'braille';

    /**
     * Rendering mode.
     * - 'auto': use image protocol if the terminal supports it, otherwise character mode
     * - 'image': force image protocol (no-op if unsupported)
     * - 'character': always use character mode (block/braille)
     * @default 'auto'
     */
    mode?: 'auto' | 'image' | 'character';

    /**
     * Chart height in character rows (image mode only).
     * A single-row sparkline is valid but taller values produce richer visuals.
     * @default 1
     */
    height?: number;

    /**
     * Color gradient for image mode (low → high).
     * Overrides the `color` prop. Defaults to the theme's heatmapGradient.
     */
    colors?: string[];

    /**
     * Pixel size per character cell in image mode.
     * @default 8
     */
    cellPx?: number;
}

let nextImageId = 1;

export const Sparkline: React.FC<SparklineProps> = ({
    data,
    width: propsWidth,
    min: userMin,
    max: userMax,
    color,
    variant = 'block',
    mode = 'auto',
    height = 1,
    colors,
    cellPx = 8,
}) => {
    const gridContext = useContext(GridItemContext);
    const theme = useTheme();
    const { stdout } = useStdout();

    const effectiveWidth = propsWidth ?? gridContext?.width;

    // Stable image ID for this instance
    const imageIdRef = useRef<number>(0);
    if (imageIdRef.current === 0) {
        imageIdRef.current = nextImageId++;
    }
    const imageId = imageIdRef.current;

    // --- Shared data processing ---
    const { processedData, min, max } = useMemo(() => {
        if (!data || data.length === 0) return { processedData: [], min: 0, max: 1 };

        let processed = data;
        if (effectiveWidth && data.length > effectiveWidth) {
            processed = lttb(data, effectiveWidth);
        }

        const lo = userMin ?? Math.min(...processed);
        let hi = userMax ?? Math.max(...processed);
        if (hi === lo) hi = lo + 1;

        return { processedData: processed, min: lo, max: hi };
    }, [data, effectiveWidth, userMin, userMax]);

    // --- Detect image protocol ---
    const protocol: ImageProtocol | null = useMemo(() => {
        if (mode === 'character') return null;
        return detectImageProtocol();
    }, [mode]);

    const useImage = protocol !== null && mode !== 'character';

    // Character column count in the terminal
    const charCols = effectiveWidth ?? processedData.length;
    const charRows = height;

    // --- Build PNG for image mode ---
    const pngBuf = useMemo(() => {
        if (!useImage || charCols === 0) return null;

        const widthPx = charCols * cellPx;
        const heightPx = charRows * cellPx;

        // Color function: colors prop → gradient; color prop → solid; default → theme gradient
        const effectiveColors = colors ?? (color ? [color] : theme.heatmapGradient);
        const colorFn = gradientColorFn(effectiveColors);

        const pixelGrid = buildSparklinePixelGrid(
            processedData,
            widthPx,
            heightPx,
            min,
            max,
            colorFn,
        );

        return createRgbPng(pixelGrid);
    }, [useImage, charCols, charRows, cellPx, colors, color, theme.heatmapGradient, processedData, min, max]);

    // --- Kitty: upload on data change, delete on unmount ---
    useEffect(() => {
        if (protocol !== 'kitty' || !pngBuf) return;

        // cols = number of placeholder cells (each cell = 1 terminal col, trailingSpace=false)
        const uploadSeq = encodeKittyUpload(pngBuf, charCols, charRows, imageId);
        stdout.write(uploadSeq);

        return () => {
            stdout.write(encodeKittyDelete(imageId));
        };
    }, [pngBuf, protocol, imageId, charCols, charRows, stdout]);

    // --- iTerm2: cursor-up write on data change ---
    useEffect(() => {
        if (protocol !== 'iterm2' || !pngBuf) return;
        const seq = encodeIterm2(pngBuf, charCols);
        stdout.write(`\x1b[${charRows}A\x1b[0G${seq}\x1b[${charRows}B`);
    }, [pngBuf, protocol, charCols, charRows, stdout]);

    // --- Kitty placeholder rendering (1 terminal col per placeholder, no trailing space) ---
    if (protocol === 'kitty' && useImage && charCols > 0) {
        const placeholderText = encodeKittyPlaceholders(charCols, charRows, imageId, {
            trailingSpace: false,
        });
        const lines = placeholderText.split('\n');
        return (
            <Box flexDirection="column">
                {lines.map((line, i) => (
                    <Text key={i}>{line}</Text>
                ))}
            </Box>
        );
    }

    // --- iTerm2 placeholder (blank rows reserved for the image) ---
    if (protocol === 'iterm2' && useImage && charCols > 0) {
        return (
            <Box flexDirection="column">
                {Array.from({ length: charRows }, (_, i) => (
                    <Text key={i}>{' '.repeat(charCols)}</Text>
                ))}
            </Box>
        );
    }

    // --- Character mode ---
    if (processedData.length === 0) return <Text>{color ? <Text color={color}>{''}</Text> : ''}</Text>;

    const levels = variant === 'braille' ? SPARK_LEVELS_BRAILLE : SPARK_LEVELS_BLOCK;
    const text = processedData
        .map((v) => {
            const value = Math.max(min, Math.min(max, v));
            const normalized = (value - min) / (max - min);
            const index = Math.round(normalized * (levels.length - 1));
            return levels[index];
        })
        .join('');

    return <Text {...(color ? { color } : {})}>{text}</Text>;
};
