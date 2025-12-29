import { describe, expect, it } from 'vitest';
import { BlockRenderer } from '../../src/core/block';
import { Pixel } from '../../src/core/types';

// Helper function: create mock pixel columns
function createPixels(leftHeight: number, rightHeight: number): Pixel[][] {
    const pixels: Pixel[][] = [];
    for (let y = 0; y < 8; y++) {
        pixels[y] = [];
        // Block renderer bottom-up logic (y=0 is startY)
        // In renderCanvas, pixels are absolute coordinates
        // Here we simulate a single 2x8 block
        // Note: calculateColumnHeight counts from top (py=0) to bottom (py=7)
        // To test standard (non-inverted) rendering, we fill from the BOTTOM.
        // py=7 is bottom, py=0 is top.
        // y < leftHeight means we fill the FIRST leftHeight rows... wait.
        // If we want it to be BOTTOM-HEAVY (Standard Mode), we fill py=7, py=6, etc.
        // Fill from bottom (py=7 down to 0)
        pixels[y][0] = { active: (7 - y) < leftHeight };
        pixels[y][1] = { active: (7 - y) < rightHeight };
    }
    return pixels;
}

describe('BlockRenderer LUT', () => {
    const renderer = new BlockRenderer();

    // Helper test function: render 2x8 canvas and return the first character
    function renderChar(leftHeight: number, rightHeight: number): string {
        const pixels = createPixels(leftHeight, rightHeight);
        const lines = renderer.renderCanvas(pixels, 2, 8);
        return lines[0][0].text;
    }

    it('should correctly render empty and full', () => {
        expect(renderChar(0, 0)).toBe(' ');
        expect(renderChar(8, 8)).toBe('█');
    });

    it('should correctly render full height on one side (Left)', () => {
        expect(renderChar(8, 0)).toBe('▌');
        // Conservative: 5-6 -> ▖
        expect(renderChar(6, 0)).toBe('▖');
    });

    it('should correctly render full height on one side (Right)', () => {
        expect(renderChar(0, 8)).toBe('▐');
        // Conservative: 5-6 -> ▗
        expect(renderChar(0, 6)).toBe('▗');
    });

    it('should correctly render half height quadrant (Left)', () => {
        // level 3-5 maps to ▖
        expect(renderChar(3, 0)).toBe('▖');
        expect(renderChar(4, 0)).toBe('▖');
    });

    it('should correctly render half height quadrant (Right)', () => {
        // level 3-5 maps to ▗
        expect(renderChar(0, 3)).toBe('▗');
        expect(renderChar(0, 4)).toBe('▗');
    });

    it('should correctly render diagonal (average)', () => {
        expect(renderChar(4, 4)).toBe('▄');
        expect(renderChar(2, 2)).toBe('▂');
    });

    it('low height should be shown (Left/Right >= 1)', () => {
        // Updated LUT is more sensitive: [2][0] -> '▖'
        expect(renderChar(2, 0)).toBe('▖');
        // [0][2] -> '▗'
        expect(renderChar(0, 2)).toBe('▗');
    });

    it('mixed cases should fallback to Block', () => {
        // [5][5] -> ▄ (full width half height)
        expect(renderChar(5, 5)).toBe('▅');

        // [3][2] -> 2.5 -> ▃ (Level 3)
        // LUT table: row 3, col 2 -> '▃'
        expect(renderChar(3, 2)).toBe('▃');
    });
});
