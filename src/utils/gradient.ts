/**
 * Gradient tool module
 *
 * Use tinygradient and chalk to implement terminal color gradients
 */

import chalk from 'chalk';
import tinygradient from 'tinygradient';

/**
 * Generate gradient color array
 *
 * @param colors - Start and end color array (supports hex, rgb, css color names)
 * @param steps - Interpolation steps
 * @returns Chalk color function array
 *
 * @example
 * const gradient = createGradient(['#00f', '#0ff', '#0f0'], 10);
 * gradient[0]('text'); // Blue
 * gradient[9]('text'); // Green
 */
export function createGradient(colors: string[], steps: number): Array<(text: string) => string> {
    if (colors.length === 0) {
        return Array(steps).fill((text: string) => text);
    }

    if (colors.length === 1) {
        // Single color, no gradient needed
        const color = colors[0];
        if (color) {
            const colorFn = (text: string) => chalk.hex(color)(text);
            return Array(steps).fill(colorFn);
        }
        return Array(steps).fill((text: string) => text);
    }

    // Use tinygradient for the gradient
    const gradient = tinygradient(colors);
    const rgbColors = gradient.rgb(steps);

    return rgbColors.map((color) => {
        const hex = color.toHex();
        return (text: string) => chalk.hex(hex)(text);
    });
}

// One Dark palette definitions
// Source: Atom One Dark Theme
export const ONE_DARK_PALETTES = {
    /** One Dark - Classic theme */
    standard: [
        '#61afef', // blue
        '#98c379', // green
        '#e5c07b', // yellow
        '#c678dd', // purple
        '#e06c75', // red
        '#56b6c2', // cyan
        '#d19a66', // orange
        '#abb2bf', // gray
    ],
    /** One Dark Vivid - More vibrant variant */
    vivid: [
        '#61afef', // blue
        '#98c379', // green
        '#e5c07b', // yellow
        '#c678dd', // purple
        '#e06c75', // red
        '#56b6c2', // cyan
        '#be5046', // dark red
        '#d19a66', // orange
        '#528bff', // bright blue
    ],
};

/**
 * Palette type
 * Supports built-in palette names or custom color arrays
 */
export type ColorPalette = 'one-dark' | 'one-dark-vivid' | string[];

/**
 * Assign different colors for data series
 *
 * @param seriesCount - Number of series
 * @param palette - Palette configuration (default: 'one-dark')
 * @returns Color array (hex format)
 *
 * @example
 * const colors = assignColors(5);
 * // Use Vivid variant
 * const vividColors = assignColors(5, 'one-dark-vivid');
 */
export function assignColors(seriesCount: number, palette: ColorPalette = 'one-dark'): string[] {
    if (seriesCount === 0) {
        return [];
    }

    let baseColors: string[];

    if (Array.isArray(palette)) {
        baseColors = palette;
    } else {
        switch (palette) {
            case 'one-dark-vivid':
                baseColors = ONE_DARK_PALETTES.vivid;
                break;
            default:
                baseColors = ONE_DARK_PALETTES.standard;
                break;
        }
    }

    // If series count is within palette range, return slice directly
    // Prefer using first colors in palette to maintain consistency
    if (seriesCount <= baseColors.length) {
        return baseColors.slice(0, seriesCount);
    }

    // If series count exceeds palette, use gradient to generate more colors to cover full range
    const gradient = tinygradient(baseColors);
    return gradient.rgb(seriesCount).map((c) => c.toHex());
}

/**
 * Convert color string to chalk color function
 *
 * @param color - Color string (hex, css color names)
 * @returns Chalk color function
 *
 * @example
 * const colorFn = colorToChalk('#ff0000');
 * console.log(colorFn('Red text'));
 */
export function colorToChalk(color: string): (text: string) => string {
    // If it's a hex color (#rrggbb or #rgb)
    if (color.startsWith('#')) {
        return (text: string) => chalk.hex(color)(text);
    }

    // Try using chalk built-in colors
    // @ts-expect-error - chalk dynamic color access
    if (typeof chalk[color] === 'function') {
        // @ts-expect-error - chalk dynamic color access
        return (text: string) => chalk[color](text);
    }

    // Default to returning original text
    return (text: string) => text;
}
