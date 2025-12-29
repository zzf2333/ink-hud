import type { Pixel, RenderedLine } from './types';
import type { RendererMetadata } from './renderer';
import { Renderer } from './renderer';

const BRAILLE_BASE = 0x2800;
const DOT_WEIGHTS = [1, 2, 4, 8, 16, 32, 64, 128];

/**
 * Braille Renderer
 *
 * Implements 2x4 dot matrix rendering using Braille Unicode characters (U+2800-U+28FF)
 * Each character can represent 8 sub-pixels, providing 8x resolution
 */
export class BrailleRenderer extends Renderer {
    getMetadata(): RendererMetadata {
        return {
            name: 'braille',
            displayName: 'Braille',
            description: 'Braille character (⣿) 2x4 matrix, 8x resolution',
            resolution: {
                horizontal: 2,
                vertical: 4,
            },
            requiresUtf8: true,
            requiresUnicode: true,
            minScore: 80,
        };
    }

    // ============================================================
    // Braille-specific private methods
    // ============================================================

    private createBrailleChar(dots: boolean[]): string {
        let code = BRAILLE_BASE;
        for (let i = 0; i < 8 && i < DOT_WEIGHTS.length; i++) {
            if (dots[i]) {
                const weight = DOT_WEIGHTS[i];
                if (weight !== undefined) {
                    code += weight;
                }
            }
        }
        return String.fromCharCode(code);
    }

    private pixelToDotIndex(x: number, y: number): number {
        // Left column: 0,1,2,6  Right column: 3,4,5,7
        if (x === 0) {
            return y === 3 ? 6 : y;
        }
        return y === 3 ? 7 : y + 3;
    }

    private fillBrailleDots(
        pixels: Pixel[][],
        cx: number,
        cy: number,
        width: number,
        height: number,
    ): boolean[] {
        const dots = Array(8).fill(false);
        for (let py = 0; py < 4; py++) {
            for (let px = 0; px < 2; px++) {
                const pixelY = cy * 4 + py;
                const pixelX = cx * 2 + px;
                if (pixelY < height && pixelX < width) {
                    dots[this.pixelToDotIndex(px, py)] = pixels[pixelY]?.[pixelX]?.active ?? false;
                }
            }
        }
        return dots;
    }

    private resolveColor(
        pixels: Pixel[][],
        cx: number,
        cy: number,
        width: number,
        height: number,
    ): string | undefined {
        const counts = new Map<string, number>();

        for (let py = 0; py < 4; py++) {
            for (let px = 0; px < 2; px++) {
                const pixelY = cy * 4 + py;
                const pixelX = cx * 2 + px;

                if (pixelY < height && pixelX < width) {
                    const pixel = pixels[pixelY]?.[pixelX];
                    if (pixel?.active && pixel.color) {
                        counts.set(pixel.color, (counts.get(pixel.color) ?? 0) + 1);
                    }
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
        const charHeight = Math.ceil(height / 4);
        const lines: RenderedLine[] = [];

        for (let cy = 0; cy < charHeight; cy++) {
            const lineSegments: RenderedLine = [];
            let buffer = '';
            let bufferColor: string | undefined;

            for (let cx = 0; cx < charWidth; cx++) {
                const dots = this.fillBrailleDots(pixels, cx, cy, width, height);
                const char = this.createBrailleChar(dots);
                const color = this.resolveColor(pixels, cx, cy, width, height);

                if (buffer && bufferColor !== color) {
                    lineSegments.push(
                        bufferColor ? { text: buffer, color: bufferColor } : { text: buffer },
                    );
                    buffer = '';
                }

                bufferColor = color;
                buffer += char;
            }

            if (buffer) {
                lineSegments.push(
                    bufferColor ? { text: buffer, color: bufferColor } : { text: buffer },
                );
            }
            lines.push(lineSegments);
        }

        return lines;
    }
}
