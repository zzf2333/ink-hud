import type { RendererMetadata } from './renderer';
import { Renderer } from './renderer';
import type { Pixel, RenderedLine } from './types';

/**
 * Block Elements renderer
 *
 * Implements 2x8 dot matrix rendering using Unicode Block Elements characters (U+2581-U+2588)
 * Vertical 8x resolution, horizontal 2x resolution
 */
export class BlockRenderer extends Renderer {
    // 9x9 Lookup table: [leftHeight][rightHeight] -> char
    // Index 0-8 represents filled pixel height of column
    private static readonly BLOCK_LUT: string[][] = [
        // R=0  1    2    3    4    5    6    7    8   (L Row Index)
        [' ', '▗', '▗', '▗', '▗', '▗', '▗', '▐', '▐'], // L=0
        ['▖', '▂', '▂', '▃', '▃', '▄', '▄', '▅', '▅'], // L=1: Avg 1-1.5 -> ▂
        ['▖', '▂', '▂', '▃', '▃', '▄', '▄', '▅', '▅'], // L=2
        ['▖', '▃', '▃', '▃', '▄', '▄', '▅', '▅', '▅'], // L=3: Avg 1.5-3.5
        ['▖', '▃', '▃', '▄', '▄', '▅', '▅', '▆', '▆'], // L=4
        ['▖', '▄', '▄', '▅', '▅', '▅', '▆', '▆', '▇'], // L=5
        ['▖', '▄', '▄', '▅', '▅', '▆', '▆', '▇', '▇'], // L=6
        ['▌', '▅', '▅', '▆', '▆', '▇', '▇', '▇', '█'], // L=7
        ['▌', '▅', '▅', '▆', '▆', '▇', '▇', '█', '█'], // L=8
    ];

    getMetadata(): RendererMetadata {
        return {
            name: 'block',
            displayName: 'Block Elements',
            description: 'Block Elements character (█) 2x8 matrix, vertical 8x resolution',
            resolution: {
                horizontal: 2,
                vertical: 8,
            },
            requiresUtf8: true,
            requiresUnicode: true,
            minScore: 30,
        };
    }

    // ============================================================
    // Block-specific private methods
    // ============================================================

    /**
     * Determine primary color
     */
    private resolveColor(
        pixels: Pixel[][],
        startX: number,
        startY: number,
        width: number,
        height: number,
    ): string | undefined {
        const counts = new Map<string, number>();

        for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 2; px++) {
                const y = startY + py;
                const x = startX + px;

                if (y >= height || x >= width) continue;

                const pixel = pixels[y]?.[x];
                if (pixel?.active && pixel.color) {
                    counts.set(pixel.color, (counts.get(pixel.color) ?? 0) + 1);
                }
            }
        }

        if (counts.size === 0) return undefined;

        let maxCount = 0;
        let dominantColor: string | undefined;

        for (const [color, count] of counts) {
            if (count > maxCount) {
                maxCount = count;
                dominantColor = color;
            }
        }

        return dominantColor;
    }

    // ============================================================
    // Methods that subclasses must implement
    // ============================================================

    renderCanvas(pixels: Pixel[][], width: number, height: number): RenderedLine[] {
        const charWidth = Math.ceil(width / 2);
        const charHeight = Math.ceil(height / 8);
        const lines: RenderedLine[] = [];

        for (let cy = 0; cy < charHeight; cy++) {
            const lineSegments: RenderedLine = [];
            let buffer = '';
            let bufferFg: string | undefined;
            let bufferBg: string | undefined;
            let bufferColorKey: string | undefined;

            for (let cx = 0; cx < charWidth; cx++) {
                const startY = cy * 8;
                const leftX = cx * 2;
                const rightX = cx * 2 + 1;

                // 1. Column Analysis (Calculate Height & Center of Gravity)
                // Used to determine if the column is Top-Heavy (Top-aligned content) or Bottom-Heavy
                const analyzeColumn = (colX: number) => {
                    let count = 0;
                    let sumY = 0;
                    for (let py = 0; py < 8; py++) {
                        const y = startY + py;
                        if (y >= height) break;
                        if (pixels[y]?.[colX]?.active) {
                            count++;
                            sumY += py;
                        }
                    }
                    // Gravity 0 = Top, 7 = Bottom. Center = 3.5.
                    // If center < 3.5, it's Top Heavy.
                    const gravity = count > 0 ? sumY / count : 3.5;
                    return { count, gravity };
                };

                const left = analyzeColumn(leftX);
                const right = analyzeColumn(rightX);

                const isLeftTop = left.count > 0 && left.gravity < 3.5;
                const isRightTop = right.count > 0 && right.gravity < 3.5;

                // 2. Determine Render Mode

                // Mode A: Top-Heavy Inversion
                // If BOTH columns are Top-Heavy (or one is Top and other empty), we use "Inverted Rendering".
                // We calculate the empty space at the bottom (8 - count), lookup the char for that,
                // and render it with FG=Black (Hole) and BG=Color (Fill).
                const useInverse =
                    (isLeftTop && (isRightTop || right.count === 0)) ||
                    (isRightTop && (isLeftTop || left.count === 0));

                let char = ' ';
                let isInverted = false;
                const pixelColor = this.resolveColor(pixels, leftX, startY, width, height);

                if (useInverse) {
                    const invLeft = 8 - left.count;
                    const invRight = 8 - right.count;
                    char = BlockRenderer.BLOCK_LUT[invLeft]?.[invRight] ?? ' ';
                    isInverted = true;
                } else {
                    // Mode B: Standard Histogram (Bottom-Up)
                    const finalLeft = Math.min(8, Math.max(0, left.count));
                    const finalRight = Math.min(8, Math.max(0, right.count));

                    // Fallback to basic LUT
                    char = BlockRenderer.BLOCK_LUT[finalLeft]?.[finalRight] ?? ' ';
                }

                // Color Logic
                let fgColor: string | undefined;
                let bgColor: string | undefined;

                if (char !== ' ') {
                    if (isInverted) {
                        fgColor = 'black'; // Make the char "hole"
                        bgColor = pixelColor; // Make the block background
                    } else {
                        fgColor = pixelColor;
                        bgColor = undefined;
                    }
                }

                const colorKey = `${fgColor}|${bgColor}`;

                if (buffer && bufferColorKey !== colorKey) {
                    lineSegments.push({
                        text: buffer,
                        ...(bufferFg ? { color: bufferFg } : {}),
                        ...(bufferBg ? { backgroundColor: bufferBg } : {}),
                    });
                    buffer = '';
                }

                //@ts-ignore
                bufferColorKey = colorKey;
                bufferFg = fgColor;
                bufferBg = bgColor;
                buffer += char;
            }

            if (buffer) {
                lineSegments.push({
                    text: buffer,
                    ...(bufferFg ? { color: bufferFg } : {}),
                    ...(bufferBg ? { backgroundColor: bufferBg } : {}),
                });
            }
            lines.push(lineSegments);
        }

        return lines;
    }
}
