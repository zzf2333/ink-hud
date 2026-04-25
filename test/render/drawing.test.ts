import { describe, expect, it } from 'vitest';
import { gradientColorFn, buildSparklinePixelGrid } from '../../src/render/image/drawing';

describe('gradientColorFn', () => {
    it('returns grey for empty colors array', () => {
        const fn = gradientColorFn([]);
        expect(fn(0)).toEqual([128, 128, 128]);
        expect(fn(1)).toEqual([128, 128, 128]);
    });

    it('returns constant color for single-element array', () => {
        const fn = gradientColorFn(['#ff0000']);
        expect(fn(0)).toEqual([255, 0, 0]);
        expect(fn(0.5)).toEqual([255, 0, 0]);
        expect(fn(1)).toEqual([255, 0, 0]);
    });

    it('interpolates between two colors', () => {
        const fn = gradientColorFn(['#000000', '#ffffff']);
        const mid = fn(0.5);
        // Middle should be around grey (all channels ~128)
        expect(mid[0]).toBeGreaterThan(100);
        expect(mid[0]).toBeLessThan(156);
    });

    it('clamps normalized values outside [0,1]', () => {
        const fn = gradientColorFn(['#000000', '#ffffff']);
        expect(fn(-0.5)).toEqual(fn(0));
        expect(fn(1.5)).toEqual(fn(1));
    });
});

describe('buildSparklinePixelGrid', () => {
    const identity = (n: number): [number, number, number] => [
        Math.round(n * 255),
        Math.round(n * 255),
        Math.round(n * 255),
    ];

    it('returns correct grid dimensions', () => {
        const grid = buildSparklinePixelGrid([50], 4, 8, 0, 100, identity);
        expect(grid).toHaveLength(8);
        expect(grid[0]).toHaveLength(4);
    });

    it('returns bgColor grid for empty data', () => {
        const bg: [number, number, number] = [1, 2, 3];
        const grid = buildSparklinePixelGrid([], 4, 4, 0, 100, identity, bg);
        for (const row of grid) {
            for (const px of row) {
                expect(px).toEqual(bg);
            }
        }
    });

    it('high value produces a line near the top of the grid', () => {
        // max value (100%) → yLine = 0 (top of grid)
        const grid = buildSparklinePixelGrid([100], 1, 8, 0, 100, identity);
        // Row 0 should be the bright line (not bgColor)
        const bg: [number, number, number] = [10, 10, 14];
        expect(grid[0]![0]).not.toEqual(bg);
    });

    it('low value produces a filled bottom with line near bottom', () => {
        // min value (0%) → yLine = heightPx - 1 (bottom)
        const grid = buildSparklinePixelGrid([0], 1, 8, 0, 100, identity);
        // Bottom row (index 7) should be the line, not bg
        const bg: [number, number, number] = [10, 10, 14];
        expect(grid[7]![0]).not.toEqual(bg);
    });

    it('handles single data point without crashing', () => {
        expect(() =>
            buildSparklinePixelGrid([42], 10, 10, 0, 100, identity),
        ).not.toThrow();
    });

    it('handles widthPx=1 without crashing', () => {
        expect(() =>
            buildSparklinePixelGrid([10, 50, 90], 1, 8, 0, 100, identity),
        ).not.toThrow();
    });
});
