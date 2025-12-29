import { describe, expect, it } from 'vitest';
import { AsciiRenderer } from '../../src/core/ascii';

describe('AsciiRenderer', () => {
    describe('getMetadata', () => {
        it('should return correct renderer metadata', () => {
            const renderer = new AsciiRenderer();
            const metadata = renderer.getMetadata();

            expect(metadata.name).toBe('ascii');
            expect(metadata.displayName).toBe('ASCII');
            expect(metadata.resolution).toEqual({ horizontal: 1, vertical: 3 });
            expect(metadata.requiresUtf8).toBe(false);
            expect(metadata.requiresUnicode).toBe(false);
            expect(metadata.minScore).toBe(0);
        });
    });

    describe('createCanvas', () => {
        it('should create blank canvas with specified dimensions', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(4, 4);

            expect(canvas.length).toBe(4);
            expect(canvas[0]?.length).toBe(4);
            // Pixel object API
            expect(canvas.every((row) => row.every((pixel) => pixel.active === false))).toBe(true);
        });
    });

    describe('setPixel', () => {
        it('should correctly set pixel', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(4, 4);

            renderer.setPixel(canvas, 1, 1);
            // Pixel object API
            expect(canvas[1]?.[1]?.active).toBe(true);
        });

        it('should ignore pixels out of bounds', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(4, 4);

            renderer.setPixel(canvas, -1, 0);
            renderer.setPixel(canvas, 0, -1);
            renderer.setPixel(canvas, 10, 10);
            expect(canvas).toBeDefined();
        });

        it('should support unsetting pixel', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(4, 4);

            renderer.setPixel(canvas, 1, 1, { active: true });
            renderer.setPixel(canvas, 1, 1, { active: false });
            // Pixel object API
            expect(canvas[1]?.[1]?.active).toBe(false);
        });
    });

    describe('drawLine', () => {
        it('should draw horizontal line', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(5, 1);

            renderer.drawLine(canvas, 0, 0, 4, 0);
            // Pixel object API
            expect(canvas[0]?.map((p) => p.active)).toEqual([true, true, true, true, true]);
        });

        it('should draw vertical line', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(1, 5);

            renderer.drawLine(canvas, 0, 0, 0, 4);
            const pixels = canvas.map((row) => row[0]?.active);
            expect(pixels).toEqual([true, true, true, true, true]);
        });

        it('should draw diagonal line', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(5, 5);

            renderer.drawLine(canvas, 0, 0, 4, 4);
            expect(canvas[0]?.[0]?.active).toBe(true);
            expect(canvas[1]?.[1]?.active).toBe(true);
            expect(canvas[2]?.[2]?.active).toBe(true);
            expect(canvas[3]?.[3]?.active).toBe(true);
            expect(canvas[4]?.[4]?.active).toBe(true);
        });
    });

    describe('renderCanvas - smart character selection', () => {
        // helper: extract plain text from RenderedLine[]
        const getText = (lines: Array<Array<{ text: string; color?: string }>>, lineIndex: number): string => {
            return lines[lineIndex]?.map((seg) => seg.text).join('') ?? '';
        };

        const getChar = (lines: Array<Array<{ text: string; color?: string }>>, lineIndex: number, charIndex: number): string => {
            const text = getText(lines, lineIndex);
            return text[charIndex] ?? '';
        };

        it('should render blank canvas as spaces', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(3, 3);

            const lines = renderer.renderCanvas(canvas, 3, 3);
            expect(lines.length).toBe(1);
            expect(getText(lines, 0)).toBe('   ');
        });

        it('should render horizontal line as -', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(5, 3);

            renderer.drawLine(canvas, 0, 1, 4, 1);
            const lines = renderer.renderCanvas(canvas, 5, 3);
            expect(getText(lines, 0)).toBe('-----');
        });

        it('should render vertical line as |', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(1, 6);

            renderer.drawLine(canvas, 0, 0, 0, 5);
            const lines = renderer.renderCanvas(canvas, 1, 6);
            expect(getText(lines, 0)).toBe('|');
            expect(getText(lines, 1)).toBe('|');
        });

        it('should render individual point as .', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(3, 3);

            renderer.setPixel(canvas, 1, 2); // one point at the bottom

            const lines = renderer.renderCanvas(canvas, 3, 3);
            expect(getText(lines, 0)).toBe(' . ');
        });

        it('should render intersection as +', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(3, 3);

            // draw a cross
            renderer.drawLine(canvas, 1, 0, 1, 2); // vertical line
            renderer.drawLine(canvas, 0, 1, 2, 1); // horizontal line

            const lines = renderer.renderCanvas(canvas, 3, 3);
            expect(getChar(lines, 0, 1)).toBe('+');
        });

        it('should render diagonal line as /', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(3, 3);

            renderer.drawLine(canvas, 0, 2, 2, 0);

            const lines = renderer.renderCanvas(canvas, 3, 3);
            expect(getChar(lines, 0, 1)).toBe('/');
        });

        it('should correctly handle complex patterns', () => {
            const renderer = new AsciiRenderer();
            const canvas = renderer.createCanvas(5, 6);

            // draw a rectangular frame
            renderer.drawLine(canvas, 0, 0, 4, 0); // top
            renderer.drawLine(canvas, 0, 5, 4, 5); // bottom
            renderer.drawLine(canvas, 0, 0, 0, 5); // left
            renderer.drawLine(canvas, 4, 0, 4, 5); // right

            const lines = renderer.renderCanvas(canvas, 5, 6);

            expect(getChar(lines, 0, 0)).toBe('+');
            expect(getChar(lines, 0, 4)).toBe('+');
            expect(getChar(lines, 1, 0)).toBe('+');
            expect(getChar(lines, 1, 4)).toBe('+');

            expect(getChar(lines, 0, 1)).toBe("'");
            expect(getChar(lines, 0, 2)).toBe("'");
            expect(getChar(lines, 1, 1)).toBe('_');
        });
    });

    describe('Inherited from Renderer', () => {
        it('should implement getResolution method', () => {
            const renderer = new AsciiRenderer();
            const resolution = renderer.getResolution();

            expect(resolution).toEqual({ horizontal: 1, vertical: 3 });
        });

        it('should implement getName method', () => {
            const renderer = new AsciiRenderer();
            const name = renderer.getName();

            expect(name).toBe('ascii');
        });

        it('should implement calculateCharDimensions method', () => {
            const renderer = new AsciiRenderer();
            const dims = renderer.calculateCharDimensions(10, 20);

            expect(dims).toEqual({
                cols: 10, // ceil(10/1)
                rows: 7, // ceil(20/3)
            });
        });
    });
});
