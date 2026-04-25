/**
 * Sparkline - Mini trend chart component
 */

import { Box, Text } from 'ink';
import React, { useContext, useMemo } from 'react';
import { lttb } from '../utils/downsampling';
import { gradientColorFn, buildSparklinePixelGrid } from '../render/image/drawing';
import { createRgbPng } from '../render/image/png';
import { useTheme } from '../theme/ThemeContext';
import { useImageProtocol } from '../hooks/useImageProtocol';
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
     * Rendering style for character mode. Ignored in image mode.
     * @default 'block'
     */
    variant?: 'block' | 'braille';

    /**
     * Rendering mode.
     * - 'auto': use image protocol if supported, otherwise character mode
     * - 'image': force image protocol (no-op if unsupported)
     * - 'character': always use character mode (block/braille)
     * @default 'auto'
     */
    mode?: 'auto' | 'image' | 'character';

    /**
     * Chart height in character rows (image mode only).
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

    const effectiveWidth = propsWidth ?? gridContext?.width;

    // --- Data processing (shared between character and image mode) ---
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

    const charCols = effectiveWidth ?? processedData.length;
    const charRows = height;

    // --- Build PNG (skipped in character mode or when no data) ---
    const pngBuf = useMemo(() => {
        if (mode === 'character' || charCols === 0 || processedData.length === 0) return null;

        const effectiveColors = colors ?? (color ? [color] : theme.heatmapGradient);
        const colorFn = gradientColorFn(effectiveColors);
        const pixelGrid = buildSparklinePixelGrid(
            processedData,
            charCols * cellPx,
            charRows * cellPx,
            min,
            max,
            colorFn,
        );
        return createRgbPng(pixelGrid);
    }, [mode, charCols, charRows, cellPx, colors, color, theme.heatmapGradient, processedData, min, max]);

    // --- Image protocol: upload, effects, and placeholder data ---
    // trailingSpace=false → each Kitty placeholder cell = 1 terminal col (matches character mode width)
    const { kittyLines, iterm2Cols } = useImageProtocol({
        mode,
        charCols,
        charRows,
        pngBuf,
        trailingSpace: false,
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

    // --- iTerm2 placeholder ---
    if (iterm2Cols !== null) {
        return (
            <Box flexDirection="column">
                {Array.from({ length: charRows }, (_, i) => (
                    <Text key={i}>{' '.repeat(iterm2Cols)}</Text>
                ))}
            </Box>
        );
    }

    // --- Character mode ---
    if (processedData.length === 0) {
        return <Text>{''}</Text>;
    }

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
