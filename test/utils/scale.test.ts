import { describe, expect, it } from 'vitest';
import { clamp, linearScale, normalize, scaleToRange } from '../../src/utils/scale';

describe('linearScale', () => {
    it('should correctly perform linear mapping', () => {
        expect(linearScale(50, [0, 100], [0, 10])).toBe(5);
        expect(linearScale(75, [0, 100], [0, 20])).toBe(15);
        expect(linearScale(0, [0, 100], [0, 10])).toBe(0);
        expect(linearScale(100, [0, 100], [0, 10])).toBe(10);
    });

    it('should handle negative ranges', () => {
        expect(linearScale(0, [-10, 10], [0, 100])).toBe(50);
        expect(linearScale(-10, [-10, 10], [0, 100])).toBe(0);
        expect(linearScale(10, [-10, 10], [0, 100])).toBe(100);
    });

    it('should handle reverse ranges', () => {
        expect(linearScale(50, [0, 100], [10, 0])).toBe(5);
        expect(linearScale(0, [0, 100], [10, 0])).toBe(10);
        expect(linearScale(100, [0, 100], [10, 0])).toBe(0);
    });

    it('should handle case where domain range is 0', () => {
        expect(linearScale(5, [5, 5], [0, 10])).toBe(0);
        expect(linearScale(10, [10, 10], [0, 10])).toBe(0);
    });

    it('should handle fractional numbers', () => {
        expect(linearScale(0.5, [0, 1], [0, 100])).toBe(50);
        expect(linearScale(0.25, [0, 1], [0, 100])).toBe(25);
    });
});

describe('normalize', () => {
    it('should normalize data to [0, 1]', () => {
        expect(normalize([0, 50, 100])).toEqual([0, 0.5, 1]);
        expect(normalize([10, 20, 30])).toEqual([0, 0.5, 1]);
    });

    it('should handle negative numbers', () => {
        const result = normalize([-10, 0, 10]);
        expect(result[0]).toBe(0);
        expect(result[1]).toBe(0.5);
        expect(result[2]).toBe(1);
    });

    it('should handle case where all values are the same', () => {
        expect(normalize([5, 5, 5])).toEqual([0.5, 0.5, 0.5]);
        expect(normalize([0, 0, 0])).toEqual([0.5, 0.5, 0.5]);
    });

    it('should handle empty arrays', () => {
        expect(normalize([])).toEqual([]);
    });

    it('should handle single element', () => {
        expect(normalize([10])).toEqual([0.5]);
    });
});

describe('scaleToRange', () => {
    it('should scale data to specified range', () => {
        expect(scaleToRange([0, 50, 100], [0, 10])).toEqual([0, 5, 10]);
        expect(scaleToRange([10, 20, 30], [0, 100])).toEqual([0, 50, 100]);
    });

    it('should handle negative ranges', () => {
        const result = scaleToRange([-10, 0, 10], [0, 100]);
        expect(result).toEqual([0, 50, 100]);
    });

    it('should handle case where all values are the same', () => {
        const result = scaleToRange([5, 5, 5], [0, 10]);
        expect(result).toEqual([5, 5, 5]); // Middle value
    });

    it('should handle empty arrays', () => {
        expect(scaleToRange([], [0, 10])).toEqual([]);
    });

    it('should handle reverse ranges', () => {
        expect(scaleToRange([0, 50, 100], [10, 0])).toEqual([10, 5, 0]);
    });
});

describe('clamp', () => {
    it('should clamp values within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-5, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle boundary values', () => {
        expect(clamp(0, 0, 10)).toBe(0);
        expect(clamp(10, 0, 10)).toBe(10);
    });

    it('should handle negative ranges', () => {
        expect(clamp(0, -10, 10)).toBe(0);
        expect(clamp(-15, -10, 10)).toBe(-10);
        expect(clamp(15, -10, 10)).toBe(10);
    });

    it('should handle fractional numbers', () => {
        expect(clamp(0.5, 0, 1)).toBe(0.5);
        expect(clamp(1.5, 0, 1)).toBe(1);
        expect(clamp(-0.5, 0, 1)).toBe(0);
    });
});
