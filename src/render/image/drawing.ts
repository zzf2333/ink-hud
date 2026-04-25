/**
 * Shared pixel-grid drawing utilities for image-mode chart components.
 * All functions produce RGB[][], ready to pass to createRgbPng().
 */

import tinygradient from 'tinygradient';
import { hexToRgb } from './png';

type RGB = [number, number, number];

function clamp(v: number, lo: number, hi: number): number {
    return v < lo ? lo : v > hi ? hi : v;
}

function darken(rgb: RGB, factor: number): RGB {
    return [Math.round(rgb[0] * factor), Math.round(rgb[1] * factor), Math.round(rgb[2] * factor)];
}

/**
 * Returns a function that maps a normalized value [0, 1] to an RGB color
 * by interpolating through the provided color stops (256-step palette).
 */
export function gradientColorFn(colors: string[]): (normalized: number) => RGB {
    if (colors.length === 0) return () => [128, 128, 128];
    if (colors.length === 1) {
        const rgb = hexToRgb(colors[0]!);
        return () => rgb;
    }
    const g = tinygradient(colors);
    const palette = g.rgb(256).map((c): RGB => hexToRgb('#' + c.toHex()));
    return (normalized: number) => {
        const idx = clamp(Math.floor(normalized * 256), 0, 255);
        return palette[idx] ?? [128, 128, 128];
    };
}

/**
 * Build an RGB pixel grid for a sparkline area chart.
 *
 * Each data value is linearly interpolated across pixel columns.
 * The line is drawn 2 px thick; the area below is filled with a darkened version
 * of the line color. bgColor fills everything above the line.
 *
 * @param data         - Processed (downsampled) data points
 * @param widthPx      - Pixel width of the output image
 * @param heightPx     - Pixel height of the output image
 * @param min          - Data minimum (for normalization)
 * @param max          - Data maximum (for normalization)
 * @param colorFn      - Maps normalized value → RGB (use gradientColorFn)
 * @param bgColor      - Background color (default: near-black)
 */
export function buildSparklinePixelGrid(
    data: number[],
    widthPx: number,
    heightPx: number,
    min: number,
    max: number,
    colorFn: (normalized: number) => RGB,
    bgColor: RGB = [10, 10, 14],
): RGB[][] {
    const grid: RGB[][] = Array.from({ length: heightPx }, () =>
        Array.from({ length: widthPx }, () => [...bgColor] as RGB),
    );

    if (data.length === 0 || widthPx === 0 || heightPx === 0) return grid;

    const range = max === min ? 1 : max - min;

    for (let x = 0; x < widthPx; x++) {
        // Linear interpolation across data points
        const t = data.length === 1 ? 0 : (x / Math.max(widthPx - 1, 1)) * (data.length - 1);
        const baseIdx = clamp(Math.floor(t), 0, data.length - 2);
        const frac = data.length === 1 ? 0 : t - baseIdx;
        const raw =
            data.length === 1
                ? (data[0] ?? 0)
                : (data[baseIdx] ?? 0) * (1 - frac) + (data[baseIdx + 1] ?? 0) * frac;

        const normalized = clamp((raw - min) / range, 0, 1);
        const yLine = Math.round((1 - normalized) * (heightPx - 1));
        const lineRgb = colorFn(normalized);
        const fillRgb = darken(lineRgb, 0.28);

        // Area fill below the line
        for (let y = yLine + 2; y < heightPx; y++) {
            grid[y]![x] = fillRgb;
        }
        // Soft transition pixel between line and fill
        if (yLine + 1 < heightPx) {
            grid[yLine + 1]![x] = darken(lineRgb, 0.55);
        }
        // Line: 2 px (full brightness + dimmer cap above)
        grid[yLine]![x] = lineRgb;
        if (yLine - 1 >= 0) {
            grid[yLine - 1]![x] = darken(lineRgb, 0.75);
        }
    }

    return grid;
}
