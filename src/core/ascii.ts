import type { RendererMetadata } from './renderer';
import { Renderer } from './renderer';
import type { Pixel, RenderedLine } from './types';

/**
 * ASCII renderer
 *
 * Implements 1x3 dot matrix rendering using basic ASCII characters
 * Simulates subtle height variations using top/middle/bottom character segments
 */
export class AsciiRenderer extends Renderer {
    getMetadata(): RendererMetadata {
        return {
            name: 'ascii',
            displayName: 'ASCII',
            description: "ASCII character (. _ - ' / \\ |) 1x3 resolution, maximum compatibility",
            resolution: {
                horizontal: 1,
                vertical: 3,
            },
            requiresUtf8: false,
            requiresUnicode: false,
            minScore: 0, // No requirements, usable in any terminal
        };
    }

    // ============================================================
    // ASCII-specific private methods
    // ============================================================

    /**
     * Check if the pixel at the specified position is set
     */
    private isPixelSet(pixels: Pixel[][], x: number, y: number): boolean {
        const row = pixels[y];
        if (!row) return false;
        return row[x]?.active ?? false;
    }

    private getCellPositions(pixels: Pixel[][], x: number, baseY: number): number[] {
        const positions: number[] = [];
        for (let offset = 0; offset < 3; offset++) {
            if (this.isPixelSet(pixels, x, baseY + offset)) {
                positions.push(offset);
            }
        }
        return positions;
    }

    private getNeighborPosition(pixels: Pixel[][], x: number, baseY: number): number | null {
        const positions = this.getCellPositions(pixels, x, baseY);
        if (positions.length === 0) {
            return null;
        }
        const sum = positions.reduce((total, value) => total + value, 0);
        return sum / positions.length;
    }

    private selectMultiPixelChar(hasAnyLeft: boolean, hasAnyRight: boolean): string {
        return hasAnyLeft || hasAnyRight ? '+' : '|';
    }

    private selectHorizontalChar(pos: number): string {
        if (pos === 0) {
            return "'";
        }
        if (pos === 1) {
            return '-';
        }
        return '_';
    }

    private selectDiagonalChar(params: {
        pos: number;
        hasAnyLeft: boolean;
        hasAnyRight: boolean;
        leftPos: number | null;
        rightPos: number | null;
    }): string | null {
        const { pos, hasAnyLeft, hasAnyRight, leftPos, rightPos } = params;
        if (hasAnyLeft && leftPos !== null && leftPos !== pos) {
            return pos < leftPos ? '/' : '\\';
        }
        if (hasAnyRight && rightPos !== null && rightPos !== pos) {
            return pos > rightPos ? '/' : '\\';
        }
        return null;
    }

    private selectIsolatedChar(pos: number): string {
        if (pos === 0) {
            return '"';
        }
        if (pos === 1) {
            return '+';
        }
        return '.';
    }

    private selectSinglePixelChar(params: {
        pos: number;
        hasSameHorizontal: boolean;
        hasAnyLeft: boolean;
        hasAnyRight: boolean;
        leftPos: number | null;
        rightPos: number | null;
    }): string {
        const { pos, hasSameHorizontal, hasAnyLeft, hasAnyRight, leftPos, rightPos } = params;

        if (hasSameHorizontal) {
            return this.selectHorizontalChar(pos);
        }
        const diagonal = this.selectDiagonalChar({
            pos,
            hasAnyLeft,
            hasAnyRight,
            leftPos,
            rightPos,
        });
        if (diagonal) {
            return diagonal;
        }
        return this.selectIsolatedChar(pos);
    }

    /**
     * Intelligently select ASCII character
     * Select appropriate character based on 1x3 vertical pixels and adjacent column connections
     */
    private selectAsciiChar(pixels: Pixel[][], x: number, baseY: number): string {
        const positions = this.getCellPositions(pixels, x, baseY);
        if (positions.length === 0) {
            return ' ';
        }

        const leftPos = this.getNeighborPosition(pixels, x - 1, baseY);
        const rightPos = this.getNeighborPosition(pixels, x + 1, baseY);

        const hasAnyLeft = leftPos !== null;
        const hasAnyRight = rightPos !== null;

        if (positions.length >= 2) {
            return this.selectMultiPixelChar(hasAnyLeft, hasAnyRight);
        }

        const pos = positions[0] ?? 1;
        const hasLeftSame = this.isPixelSet(pixels, x - 1, baseY + pos);
        const hasRightSame = this.isPixelSet(pixels, x + 1, baseY + pos);
        const hasSameHorizontal = hasLeftSame || hasRightSame;

        return this.selectSinglePixelChar({
            pos,
            hasSameHorizontal,
            hasAnyLeft,
            hasAnyRight,
            leftPos,
            rightPos,
        });
    }

    /**
     * Determine the primary color for this character cell
     */
    private resolveColor(pixels: Pixel[][], x: number, baseY: number): string | undefined {
        const counts = new Map<string, number>();

        for (let offset = 0; offset < 3; offset++) {
            const y = baseY + offset;
            if (y >= pixels.length) continue;
            const pixel = pixels[y]?.[x];

            if (pixel?.active && pixel.color) {
                counts.set(pixel.color, (counts.get(pixel.color) ?? 0) + 1);
            }
        }

        if (counts.size === 0) return undefined;

        // Find the color that appears most frequently
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
        const lines: RenderedLine[] = [];

        const charHeight = Math.ceil(height / 3);
        for (let cy = 0; cy < charHeight; cy++) {
            const lineSegments: RenderedLine = [];
            const baseY = cy * 3;

            let buffer = '';
            let bufferColor: string | undefined;

            for (let x = 0; x < width; x++) {
                const char = this.selectAsciiChar(pixels, x, baseY);
                const color = char === ' ' ? undefined : this.resolveColor(pixels, x, baseY);

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
