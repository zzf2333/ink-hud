/**
 * PieChart Pie chart component
 *
 * Basic pie chart display with built-in legend
 */

import { Box, Text } from 'ink';
import React, { useMemo } from 'react';
import { LEGEND } from '../symbols';
import { type ColorPalette, assignColors } from '../utils/gradient';
import { Legend } from './common/Legend';
import { getPixelDimensions, useChartLayoutSimple } from './common/chartUtils';
import { useChartRenderer } from './common/useChartRenderer';

/**
 * PieChart data item
 */
export interface PieChartDataItem {
    /** Name */
    name: string;
    /** Value */
    value: number;
    /** Color (optional, auto-assigned if not specified) */
    color?: string;
}

/**
 * PieChart component props
 */
export interface PieChartProps {
    /**
     * Data array - supports two formats:
     * 1. Simplified mode: number[] (requires labels)
     * 2. Detailed mode: PieChartDataItem[]
     */
    data?: number[] | PieChartDataItem[];

    /**
     * Label array (used in simplified mode)
     * When used with data: number[], provides name for each value
     */
    labels?: string[];

    /** Chart width (character count, default 30) */
    width?: number;

    /** Chart height (character lines, default 15) */
    height?: number;

    /** Outer radius (pixels, auto-calculated by default) */
    radius?: number;

    /** Aspect ratio correction (default 2) */
    aspectRatio?: number;

    /** Donut inner radius ratio (0-1, default 0) */
    donutRatio?: number;

    /** Whether to show percentage labels (default false) */
    showLabels?: boolean;

    /** Whether to show legend (default true) */
    showLegend?: boolean;

    /** Legend position (default 'right') */
    legendPosition?: 'right' | 'bottom';

    /** Color array (auto-assigned if not specified) */
    colors?: string[];

    /** Palette name or custom color array */
    colorPalette?: ColorPalette;

    /**
     * @deprecated Per-chart `renderer` prop has been removed.
     * Configure via `<InkHudProvider renderers={{ pie: 'block' }}>` instead.
     */
    renderer?: never;

    /**
     * @deprecated Per-chart `rendererChain` prop has been removed.
     * Configure via `<InkHudProvider renderers={{ pie: 'block' }}>` instead.
     */
    rendererChain?: never;
}

/**
 * Parse data input, unify to PieChartDataItem[] format
 */
function resolveDataItems(
    data: number[] | PieChartDataItem[] | undefined,
    labels?: string[],
): PieChartDataItem[] {
    if (!data || data.length === 0) {
        return [];
    }

    // Check if simplified mode (number[])
    if (typeof data[0] === 'number') {
        return (data as number[]).map((value, i) => ({
            name: labels?.[i] ?? `Item ${i + 1}`,
            value,
        }));
    }

    // Detailed mode (PieChartDataItem[])
    return data as PieChartDataItem[];
}

const TWO_PI = Math.PI * 2;
const START_ANGLE = -Math.PI / 2;

// Geometry proof (renderer-agnostic):
//   ratio = 2 * horizontal / vertical  (braille 1.0, block 0.5)
//   dy_effective = (y - centerY) * ratio
//   For a point at y = centerY ± k pixels, distance = |k * ratio|
//   → outerRadius = k * ratio → k = outerRadius / ratio
//   vertical span in pixels = 2 * outerRadius / ratio
//   vertical span in char-rows = 2 * outerRadius / ratio / vertical
//     = 2R / (2 * horizontal / vertical) / vertical   (substituting ratio)
//     = 2R / (2 * horizontal)
//     = R / horizontal  (= R/2 for both braille h=2 and block h=2)
//   horizontal span in pixels = 2 * outerRadius (no ratio on x)
//   horizontal span in char-rows = 2 * outerRadius / horizontal = R  (= R for h=2)
// → With 1 char margin each side: R ≤ canvasWChars - 2  AND  R/2 ≤ canvasHChars - 2
function resolveRadius(
    canvasWChars: number,
    canvasHChars: number,
    renderer: import('../core/renderer').Renderer,
    customRadius: number | undefined,
): { centerX: number; centerY: number; radius: number } {
    const { horizontal, vertical } = renderer.getResolution();
    const pixelW = canvasWChars * horizontal;
    const pixelH = canvasHChars * vertical;
    const centerX = Math.floor(pixelW / 2);
    const centerY = Math.floor(pixelH / 2);
    // 1 char-row margin left/right → R ≤ canvasW - 2
    // 1 char-row margin top/bottom → R/2 ≤ canvasH - 2 → R ≤ 2*(canvasH - 2)
    const maxRadius = Math.max(0, Math.min(canvasWChars - 2, 2 * (canvasHChars - 2)));
    return { centerX, centerY, radius: customRadius ?? maxRadius };
}

function buildAngleStops(
    data: PieChartDataItem[],
    total: number,
): Array<{ index: number; end: number }> {
    if (total <= 0) {
        return [];
    }

    const stops: Array<{ index: number; end: number }> = [];
    let current = 0;
    data.forEach((item, index) => {
        if (item.value <= 0) {
            return;
        }
        current += (item.value / total) * TWO_PI;
        stops.push({ index, end: current });
    });

    return stops;
}

function resolveSliceIndex(
    angle: number,
    stops: Array<{ index: number; end: number }>,
): number | null {
    if (stops.length === 0) {
        return null;
    }

    for (const stop of stops) {
        if (angle <= stop.end) {
            return stop.index;
        }
    }
    return stops[stops.length - 1]?.index ?? null;
}

/**
 * PieChart Pie chart component
 */
export const PieChart: React.FC<PieChartProps> = ({
    data: dataProp,
    labels,
    width,
    height,
    radius: customRadius,
    aspectRatio,
    donutRatio = 0,
    showLabels = false,
    showLegend = true,
    legendPosition = 'right',
    colors,
    colorPalette,
}) => {
    // Parse data input
    const data = useMemo(() => resolveDataItems(dataProp, labels), [dataProp, labels]);

    // Pre-compute percentages early so legendNames can be passed to layout for wrapping estimate
    const percentagesEarly = useMemo(() => {
        const sum = data.reduce((acc, item) => acc + item.value, 0);
        return data.map((item) => (sum > 0 ? (item.value / sum) * 100 : 0));
    }, [data]);

    const legendNamesForLayout = useMemo(() => {
        if (!showLegend) return undefined;
        return data.map((item, i) =>
            showLabels ? `${item.name} (${percentagesEarly[i]?.toFixed(1)}%)` : item.name,
        );
    }, [data, showLegend, showLabels, percentagesEarly]);

    // 1. Layout calculation (Use simplified API, disable axes)
    const layout = useChartLayoutSimple(
        {
            ...(width !== undefined && { width }),
            ...(height !== undefined && { height }),
            showAxis: false,
            showLegend,
            legendPosition,
        },
        0,
        0,
        legendNamesForLayout,
    );

    // Constrain canvas to a visual square so the circle's container matches its shape.
    // Terminal cells are ~2:1 (height:width), so a visual square = 2:1 chars (W:H).
    // Without this, wide panels render the circle small on a wide rectangle, leaving
    // huge empty bands on left/right.
    const { totalWidth, plotWidth: plotW, plotHeight: plotH } = layout;
    const canvasHeight = Math.max(1, Math.min(plotH, Math.floor(plotW / 2)));
    const canvasWidth = canvasHeight * 2;

    const renderer = useChartRenderer('pie');

    // Calculate aspect ratio dynamically if not provided
    const ratio = useMemo(() => {
        if (aspectRatio !== undefined) return aspectRatio;
        const resolution = renderer.getResolution();
        // Standard terminal character is ~2:1 (Height:Width).
        // Correction = 2 * (PixelWidth / PixelHeight)
        // e.g. Braille (2x4): 2 * (2/4) = 1.0 (Square pixels)
        // e.g. Block (2x8): 2 * (2/8) = 0.5 (Wide pixels)
        return 2 * (resolution.horizontal / resolution.vertical);
    }, [aspectRatio, renderer]);

    const itemColors = useMemo(() => {
        if (colors && colors.length >= data.length) {
            return colors;
        }
        if (colors && colors.length > 0) {
            return assignColors(data.length, colors);
        }
        return assignColors(data.length, colorPalette);
    }, [data.length, colors, colorPalette]);

    const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);
    // percentagesEarly and percentages are identical — reuse to avoid double computation
    const percentages = percentagesEarly;

    const coloredLines = useMemo(() => {
        if (data.length === 0 || total <= 0) {
            return [];
        }

        const { pixelWidth, pixelHeight } = getPixelDimensions(renderer, canvasWidth, canvasHeight);
        const canvas = renderer.createCanvas(pixelWidth, pixelHeight);

        const {
            centerX,
            centerY,
            radius: outerRadius,
        } = resolveRadius(canvasWidth, canvasHeight, renderer, customRadius);

        const innerRadius = outerRadius * donutRatio;
        const angleStops = buildAngleStops(data, total);

        // Unified rendering loop: calculate slice for each pixel and set color
        // No longer care if renderer uses ASCII or Braille, Renderer handles this
        for (let y = 0; y < pixelHeight; y++) {
            const dy = (y - centerY) * ratio; // Apply aspect ratio correction
            for (let x = 0; x < pixelWidth; x++) {
                const dx = x - centerX;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > outerRadius || distance < innerRadius) {
                    continue;
                }

                const angle = (Math.atan2(dy, dx) - START_ANGLE + TWO_PI) % TWO_PI;
                const sliceIndex = resolveSliceIndex(angle, angleStops);

                if (sliceIndex !== null) {
                    const color = data[sliceIndex]?.color ?? itemColors[sliceIndex];
                    if (color) {
                        renderer.setPixel(canvas, x, y, { active: true, color });
                    }
                }
            }
        }

        return renderer.renderCanvas(canvas, pixelWidth, pixelHeight);
    }, [
        data,
        total,
        renderer,
        canvasWidth,
        canvasHeight,
        customRadius,
        ratio,
        donutRatio,
        itemColors,
    ]);

    const legendItems = useMemo(() => {
        return data.map((item, i) => ({
            name: showLabels ? `${item.name} (${percentages[i]?.toFixed(1)}%)` : item.name,
            color: item.color ?? itemColors[i] ?? 'cyan',
            symbol: LEGEND.dot,
        }));
    }, [data, itemColors, showLabels, percentages]);

    if (coloredLines.length === 0) {
        return null;
    }

    return (
        <Box flexDirection="column" width={totalWidth} height={layout.totalHeight}>
            <Box flexDirection="row" justifyContent="center">
                <Box flexDirection="column" width={canvasWidth}>
                    {coloredLines.map((segments, i) => (
                        <Text key={`chart-line-${i}`}>
                            {segments.map((segment, j) => (
                                <Text
                                    key={`seg-${i}-${j}`}
                                    {...(segment.color ? { color: segment.color } : {})}
                                    {...(segment.backgroundColor
                                        ? { backgroundColor: segment.backgroundColor }
                                        : {})}
                                >
                                    {segment.text}
                                </Text>
                            ))}
                        </Text>
                    ))}
                </Box>

                {showLegend && legendPosition === 'right' && (
                    <Box marginLeft={2}>
                        <Legend items={legendItems} position="vertical" />
                    </Box>
                )}
            </Box>

            {showLegend && legendPosition === 'bottom' && (
                <Box marginTop={1} width={totalWidth} justifyContent="center">
                    <Legend items={legendItems} position="horizontal" />
                </Box>
            )}
        </Box>
    );
};
