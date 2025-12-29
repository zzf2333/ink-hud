import { describe, expect, it } from 'vitest';
import { Renderer, type RendererMetadata } from '../../src/core/renderer';
import type { Pixel, RenderedLine } from '../../src/core/types';

/**
 * Mock renderer for testing base class functionality
 */
class MockRenderer extends Renderer {
    getMetadata(): RendererMetadata {
        return {
            name: 'braille',
            displayName: 'Test Renderer',
            description: 'A test renderer',
            resolution: {
                horizontal: 2,
                vertical: 4,
            },
            requiresUtf8: true,
            requiresUnicode: true,
            minScore: 50,
        };
    }

    createCanvas(width: number, height: number): Pixel[][] {
        return Array.from({ length: height }, () =>
            Array.from({ length: width }, () => ({ active: false }))
        );
    }

    setPixel(canvas: Pixel[][], x: number, y: number, pixel: Partial<Pixel> = { active: true }): void {
        const row = canvas[y];
        if (y >= 0 && y < canvas.length && row && x >= 0 && x < row.length) {
            const p = row[x];
            if (p) {
                row[x] = { ...p, ...pixel };
            }
        }
    }

    drawLine(canvas: Pixel[][], x0: number, y0: number, _x1: number, _y1: number, pixel?: Partial<Pixel>): void {
        // simple implementation: only draw starting point
        this.setPixel(canvas, x0, y0, pixel);
    }

    renderCanvas(_pixels: Pixel[][], _width: number, _height: number): RenderedLine[] {
        return [[{ text: 'test' }]];
    }
}

describe('Renderer', () => {
    describe('getResolution', () => {
        it('should return renderer resolution info', () => {
            const renderer = new MockRenderer();
            const resolution = renderer.getResolution();

            expect(resolution).toEqual({
                horizontal: 2,
                vertical: 4,
            });
        });
    });

    describe('getName', () => {
        it('should return renderer name', () => {
            const renderer = new MockRenderer();
            const name = renderer.getName();

            expect(name).toBe('braille');
        });
    });

    describe('calculateCharDimensions', () => {
        it('should correctly calculate character dimensions', () => {
            const renderer = new MockRenderer(); // 2x4 resolution

            // test divisible case
            const dims1 = renderer.calculateCharDimensions(10, 20);
            expect(dims1).toEqual({
                cols: 5, // ceil(10/2) = 5
                rows: 5, // ceil(20/4) = 5
            });

            // test non-divisible case
            const dims2 = renderer.calculateCharDimensions(7, 15);
            expect(dims2).toEqual({
                cols: 4, // ceil(7/2) = 4
                rows: 4, // ceil(15/4) = 4
            });

            // test minimum values
            const dims3 = renderer.calculateCharDimensions(1, 1);
            expect(dims3).toEqual({
                cols: 1, // ceil(1/2) = 1
                rows: 1, // ceil(1/4) = 1
            });
        });

        it('should handle zero values', () => {
            const renderer = new MockRenderer();

            const dims = renderer.calculateCharDimensions(0, 0);
            expect(dims).toEqual({
                cols: 0,
                rows: 0,
            });
        });
    });

    describe('getMetadata', () => {
        it('should return complete metadata', () => {
            const renderer = new MockRenderer();
            const metadata = renderer.getMetadata();

            expect(metadata).toBeDefined();
            expect(metadata.name).toBe('braille');
            expect(metadata.displayName).toBe('Test Renderer');
            expect(metadata.description).toBe('A test renderer');
            expect(metadata.resolution).toEqual({
                horizontal: 2,
                vertical: 4,
            });
            expect(metadata.requiresUtf8).toBe(true);
            expect(metadata.requiresUnicode).toBe(true);
            expect(metadata.minScore).toBe(50);
        });
    });
});
