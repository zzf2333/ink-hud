/**
 * PieChart Pie chart component
 *
 * Basic pie chart display with built-in legend
 */

import { Box, Text } from 'ink';
import React, { useMemo } from 'react';
import type { RendererType } from '../core/renderer';
import { type ColorPalette, assignColors } from '../utils/gradient';
import { useInkHud } from './InkHudProvider';
import { Legend } from './common/Legend';
import { getPixelDimensions, useChartLayoutSimple } from './common/chartUtils';

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

    /** Manually specify renderer type (optional) */
    renderer?: RendererType;

    /** Custom renderer fallback chain (default: ['braille', 'block', 'ascii']) */
    rendererChain?: RendererType[];

    /**
     * Height offset
     * @deprecated Recommend wrapping chart with `<Panel>`, Panel automatically handles border overhead
     */
    heightOffset?: number;

    /**
     * Width offset
     * @deprecated Recommend wrapping chart with `<Panel>`, Panel automatically handles border overhead
     */
    widthOffset?: number;
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



function resolveRadius(
    pixelWidth: number,
    pixelHeight: number,
    customRadius: number | undefined,
): { centerX: number; centerY: number; radius: number } {
    const centerX = Math.floor(pixelWidth / 2);
    const centerY = Math.floor(pixelHeight / 2);
    const maxRadius = Math.max(
        0,
        Math.min(Math.floor(pixelWidth / 2) - 1, Math.floor(pixelHeight / 2) - 1),
    );
    const radius = customRadius ?? maxRadius;

    return { centerX, centerY, radius };
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
    renderer: preferredRenderer,
    rendererChain = ['braille', 'block', 'ascii'],
    heightOffset = 0,
    widthOffset = 0,
}) => {
    // Parse data input
    const data = useMemo(
        () => resolveDataItems(dataProp, labels),
        [dataProp, labels],
    );

    // 1. Layout calculation (Use simplified API, disable axes)
    const layout = useChartLayoutSimple(
        {
            ...(width !== undefined && { width }),
            ...(height !== undefined && { height }),
            showAxis: false,
            showLegend,
            legendPosition,
            widthOffset,
            heightOffset,
        },
        0,
        0,
    );

    const {
        totalWidth,
        plotWidth: canvasWidth,
        plotHeight: canvasHeight,
    } = layout;

    const { getRenderer, selectBest } = useInkHud();

    const renderer = useMemo(() => {
        if (preferredRenderer) {
            return getRenderer(preferredRenderer);
        }
        return selectBest(rendererChain);
    }, [preferredRenderer, rendererChain, getRenderer, selectBest]);

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

    const { total, percentages } = useMemo(() => {
        const sum = data.reduce((acc, item) => acc + item.value, 0);
        const pcts = data.map((item) => (sum > 0 ? (item.value / sum) * 100 : 0));
        return { total: sum, percentages: pcts };
    }, [data]);

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
        } = resolveRadius(pixelWidth, pixelHeight, customRadius);

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
            symbol: '●',
        }));
    }, [data, itemColors, showLabels, percentages]);

    if (coloredLines.length === 0) {
        return null;
    }

    return (
        <Box flexDirection="column" width={totalWidth} alignItems="center">
            <Box flexDirection="row">
                <Box flexDirection="column">
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
                <Box marginTop={1}>
                    <Legend items={legendItems} position="horizontal" />
                </Box>
            )}
        </Box>
    );
};
