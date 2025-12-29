import { describe, expect, it } from 'vitest';
import { BrailleRenderer } from '../../src/core/braille';

describe('BrailleRenderer', () => {
    describe('getMetadata', () => {
        it('should return correct renderer metadata', () => {
            const renderer = new BrailleRenderer();
            const metadata = renderer.getMetadata();

            expect(metadata.name).toBe('braille');
            expect(metadata.displayName).toBe('Braille');
            expect(metadata.resolution).toEqual({ horizontal: 2, vertical: 4 });
            expect(metadata.requiresUtf8).toBe(true);
            expect(metadata.requiresUnicode).toBe(true);
            expect(metadata.minScore).toBe(80);
        });
    });

    describe('createCanvas', () => {
        it('should create blank canvas with specified dimensions', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(4, 8);

            expect(canvas.length).toBe(8);
            expect(canvas[0]?.length).toBe(4);
            // Pixel object API: check active property
            expect(canvas.every((row) => row.every((pixel) => pixel.active === false))).toBe(true);
        });
    });

    describe('setPixel', () => {
        it('should correctly set pixel', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(4, 4);

            renderer.setPixel(canvas, 1, 1);
            // Pixel object API: check active property
            expect(canvas[1]?.[1]?.active).toBe(true);
        });

        it('should ignore pixels out of bounds', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(4, 4);

            renderer.setPixel(canvas, -1, 0); // should not throw error
            renderer.setPixel(canvas, 0, -1);
            renderer.setPixel(canvas, 10, 10);
            expect(canvas).toBeDefined();
        });

        it('should support unsetting pixel', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(4, 4);

            renderer.setPixel(canvas, 1, 1, { active: true });
            renderer.setPixel(canvas, 1, 1, { active: false });
            // Pixel object API: check active property
            expect(canvas[1]?.[1]?.active).toBe(false);
        });
    });

    describe('drawLine', () => {
        it('should draw horizontal line', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(5, 1);

            renderer.drawLine(canvas, 0, 0, 4, 0);
            // Pixel object API: check active property of each pixel
            expect(canvas[0]?.map((p) => p.active)).toEqual([true, true, true, true, true]);
        });

        it('should draw vertical line', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(1, 5);

            renderer.drawLine(canvas, 0, 0, 0, 4);
            const pixels = canvas.map((row) => row[0]?.active);
            expect(pixels).toEqual([true, true, true, true, true]);
        });

        it('should draw diagonal line', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(5, 5);

            renderer.drawLine(canvas, 0, 0, 4, 4);
            expect(canvas[0]?.[0]?.active).toBe(true);
            expect(canvas[1]?.[1]?.active).toBe(true);
            expect(canvas[2]?.[2]?.active).toBe(true);
            expect(canvas[3]?.[3]?.active).toBe(true);
            expect(canvas[4]?.[4]?.active).toBe(true);
        });

        it('should support reverse drawing', () => {
            const renderer = new BrailleRenderer();
            const canvas1 = renderer.createCanvas(5, 1);
            const canvas2 = renderer.createCanvas(5, 1);

            renderer.drawLine(canvas1, 0, 0, 4, 0);
            renderer.drawLine(canvas2, 4, 0, 0, 0);
            expect(canvas1).toEqual(canvas2);
        });
    });

    describe('renderCanvas', () => {
        it('should render blank canvas', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(2, 4);

            const lines = renderer.renderCanvas(canvas, 2, 4);
            expect(lines.length).toBe(1); // 4 rows of pixels = 1 row of Braille character
            // renderCanvas returns RenderedLine[], each is an array of { text, color? }
            expect(lines[0]?.[0]?.text).toBe('⠀'); // 1 blank character
        });

        it('should correctly render simple pattern', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(2, 4);

            // set all pixels in the left column
            renderer.setPixel(canvas, 0, 0);
            renderer.setPixel(canvas, 0, 1);
            renderer.setPixel(canvas, 0, 2);
            renderer.setPixel(canvas, 0, 3);

            const lines = renderer.renderCanvas(canvas, 2, 4);
            expect(lines.length).toBe(1);
            // RenderedLine is an array of { text, color? }
            expect(lines[0]?.[0]?.text).toBe('⡇'); // left column all points active (points 0,1,2,6)
        });

        it('should handle non-divisible dimensions', () => {
            const renderer = new BrailleRenderer();
            const canvas = renderer.createCanvas(3, 5);

            const lines = renderer.renderCanvas(canvas, 3, 5);
            expect(lines.length).toBe(2); // ceil(5/4) = 2
            // RenderedLine is an array of { text, color? }, check char count of first line
            const firstLineText = lines[0]?.map((seg) => seg.text).join('') ?? '';
            expect(firstLineText.length).toBe(2); // ceil(3/2) = 2
        });
    });

    describe('Inherited from Renderer', () => {
        it('should implement getResolution method', () => {
            const renderer = new BrailleRenderer();
            const resolution = renderer.getResolution();

            expect(resolution).toEqual({ horizontal: 2, vertical: 4 });
        });

        it('should implement getName method', () => {
            const renderer = new BrailleRenderer();
            const name = renderer.getName();

            expect(name).toBe('braille');
        });

        it('should implement calculateCharDimensions method', () => {
            const renderer = new BrailleRenderer();
            const dims = renderer.calculateCharDimensions(10, 20);

            expect(dims).toEqual({
                cols: 5, // ceil(10/2)
                rows: 5, // ceil(20/4)
            });
        });
    });
});
