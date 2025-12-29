import { describe, expect, it } from 'vitest';
import { BlockRenderer } from '../../src/core/block';

describe('BlockRenderer', () => {
    describe('getMetadata', () => {
        it('should return correct renderer metadata', () => {
            const renderer = new BlockRenderer();
            const metadata = renderer.getMetadata();

            expect(metadata.name).toBe('block');
            expect(metadata.displayName).toBe('Block Elements');
            expect(metadata.resolution).toEqual({ horizontal: 2, vertical: 8 });
            expect(metadata.requiresUtf8).toBe(true);
            expect(metadata.requiresUnicode).toBe(true);
            expect(metadata.minScore).toBe(30);
        });
    });

    describe('createCanvas', () => {
        it('should create blank canvas with specified dimensions', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(4, 8);

            expect(canvas.length).toBe(8);
            expect(canvas[0]?.length).toBe(4);
            // Pixel object API
            expect(canvas.every((row) => row.every((pixel) => pixel.active === false))).toBe(true);
        });
    });

    describe('setPixel', () => {
        it('should correctly set pixel', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(4, 4);

            renderer.setPixel(canvas, 1, 1);
            // Pixel object API
            expect(canvas[1]?.[1]?.active).toBe(true);
        });

        it('should ignore pixels out of bounds', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(4, 4);

            renderer.setPixel(canvas, -1, 0);
            renderer.setPixel(canvas, 0, -1);
            renderer.setPixel(canvas, 10, 10);
            expect(canvas).toBeDefined();
        });

        it('should support unsetting pixel', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(4, 4);

            renderer.setPixel(canvas, 1, 1, { active: true });
            renderer.setPixel(canvas, 1, 1, { active: false });
            // Pixel object API
            expect(canvas[1]?.[1]?.active).toBe(false);
        });
    });

    describe('drawLine', () => {
        it('should draw horizontal line', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(5, 1);

            renderer.drawLine(canvas, 0, 0, 4, 0);
            // Pixel object API
            expect(canvas[0]?.map((p) => p.active)).toEqual([true, true, true, true, true]);
        });

        it('should draw vertical line', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(1, 5);

            renderer.drawLine(canvas, 0, 0, 0, 4);
            const pixels = canvas.map((row) => row[0]?.active);
            expect(pixels).toEqual([true, true, true, true, true]);
        });

        it('should draw diagonal line', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(5, 5);

            renderer.drawLine(canvas, 0, 0, 4, 4);
            expect(canvas[0]?.[0]?.active).toBe(true);
            expect(canvas[1]?.[1]?.active).toBe(true);
            expect(canvas[2]?.[2]?.active).toBe(true);
            expect(canvas[3]?.[3]?.active).toBe(true);
            expect(canvas[4]?.[4]?.active).toBe(true);
        });
    });

    describe('renderCanvas', () => {
        it('should render blank canvas', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(2, 8);

            const lines = renderer.renderCanvas(canvas, 2, 8);
            expect(lines.length).toBe(1); // 8 rows of pixels = 1 row of Block character
            // RenderedLine is an array of { text, color? }
            expect(lines[0]?.[0]?.text).toBe(' '); // blank character
        });

        it('should render fully filled canvas', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(2, 8);

            // fill the entire left column (2 cols x 8 rows)
            for (let y = 0; y < 8; y++) {
                renderer.setPixel(canvas, 0, y);
                renderer.setPixel(canvas, 1, y);
            }

            const lines = renderer.renderCanvas(canvas, 2, 8);
            expect(lines.length).toBe(1);
            // RenderedLine is an array of { text, color? }
            expect(lines[0]?.[0]?.text).toBe('█'); // fully filled
        });

        it('should render half-filled canvas', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(2, 8);

            // fill the bottom 4 rows (50% height)
            for (let y = 0; y < 4; y++) {
                renderer.setPixel(canvas, 0, y);
                renderer.setPixel(canvas, 1, y);
            }

            const lines = renderer.renderCanvas(canvas, 2, 8);
            expect(lines.length).toBe(1);
            // RenderedLine is an array of { text, color? }
            expect(lines[0]?.[0]?.text).toBe('▄'); // half-filled (4/8)
        });

        it('should handle non-divisible dimensions', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(3, 10);

            const lines = renderer.renderCanvas(canvas, 3, 10);
            expect(lines.length).toBe(2); // ceil(10/8) = 2
            // RenderedLine is an array of { text, color? }, check first row character count
            const firstLineText = lines[0]?.map((seg) => seg.text).join('') ?? '';
            expect(firstLineText.length).toBe(2); // ceil(3/2) = 2
        });

        it('should correctly render multi-level fill', () => {
            const renderer = new BlockRenderer();
            const canvas = renderer.createCanvas(8, 8);

            // create gradient: fill different heights per column
            for (let col = 0; col < 8; col++) {
                const fillHeight = col + 1; // 1-8
                for (let row = 0; row < fillHeight; row++) {
                    // Fill from bottom up
                    renderer.setPixel(canvas, col, 7 - row);
                }
            }

            const lines = renderer.renderCanvas(canvas, 8, 8);
            expect(lines.length).toBe(1);
            // every 2 columns produce one character, average heights: 1.5, 3.5, 5.5, 7.5
            // rounded: 2, 4, 6, 8
            const lineText = lines[0]?.map((seg) => seg.text).join('') ?? '';
            expect(lineText).toBe('▂▄▆█');
        });
    });

    describe('Inherited from Renderer', () => {
        it('should implement getResolution method', () => {
            const renderer = new BlockRenderer();
            const resolution = renderer.getResolution();

            expect(resolution).toEqual({ horizontal: 2, vertical: 8 });
        });

        it('should implement getName method', () => {
            const renderer = new BlockRenderer();
            const name = renderer.getName();

            expect(name).toBe('block');
        });

        it('should implement calculateCharDimensions method', () => {
            const renderer = new BlockRenderer();
            const dims = renderer.calculateCharDimensions(10, 40);

            expect(dims).toEqual({
                cols: 5, // ceil(10/2)
                rows: 5, // ceil(40/8)
            });
        });
    });
});
