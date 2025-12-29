import { describe, expect, it } from 'vitest';
import {
    computeBaselineY,
    computeSeriesExtent,
    defaultTickFormat,
    getYAxisLabelWidth,
    resolveSeriesColors,
    resolveSeriesInput,
} from '../../../src/components/common/chartUtils';

describe('resolveSeriesColors', () => {
    it('should directly use explicit color array when sufficient', () => {
        const series = [
            { name: 'A', data: [1, 2] },
            { name: 'B', data: [3, 4] },
        ];
        const colors = ['red', 'blue', 'green'];
        const result = resolveSeriesColors(series, colors);
        expect(result).toEqual(['red', 'blue']);
    });

    it('should use assignColors to extend when color array is insufficient', () => {
        const series = [
            { name: 'A', data: [1] },
            { name: 'B', data: [2] },
            { name: 'C', data: [3] },
        ];
        // tinygradient needs at least 2 colors to generate gradient
        const colors = ['red', 'blue'];
        const result = resolveSeriesColors(series, colors);
        expect(result).toHaveLength(3);
        // gradient will go from red to blue
        expect(result[0]).toBeDefined();
    });

    it('should use default palette when no colors provided', () => {
        const series = [
            { name: 'A', data: [1] },
            { name: 'B', data: [2] },
        ];
        const result = resolveSeriesColors(series);
        expect(result).toHaveLength(2);
        expect(result[0]).toBeDefined();
        expect(result[1]).toBeDefined();
    });

    it('should return empty array for empty series', () => {
        expect(resolveSeriesColors([])).toEqual([]);
    });
});

describe('resolveSeriesInput', () => {
    it('should prioritize using series array', () => {
        const series = [{ name: 'Test', data: [1, 2, 3] }];
        const result = resolveSeriesInput({ series, data: [4, 5, 6] });
        expect(result).toEqual(series);
    });

    it('should use data + seriesName when series is empty', () => {
        const result = resolveSeriesInput({
            data: [1, 2, 3],
            seriesName: 'Custom',
        });
        expect(result).toEqual([{ name: 'Custom', data: [1, 2, 3] }]);
    });

    it('should use default name when data is not empty but no seriesName provided', () => {
        const result = resolveSeriesInput({ data: [1, 2] });
        expect(result).toEqual([{ name: 'Series', data: [1, 2] }]);
    });

    it('should use data when series is an empty array', () => {
        const result = resolveSeriesInput({ series: [], data: [1, 2] });
        expect(result).toEqual([{ name: 'Series', data: [1, 2] }]);
    });

    it('should return empty array when both are empty', () => {
        expect(resolveSeriesInput({})).toEqual([]);
        expect(resolveSeriesInput({ series: [], data: [] })).toEqual([]);
    });
});

describe('computeSeriesExtent', () => {
    it('should handle normal multi-series data', () => {
        const series = [
            { name: 'A', data: [1, 5, 3] },
            { name: 'B', data: [2, 8, 4] },
        ];
        const result = computeSeriesExtent(series);
        expect(result.min).toBe(1);
        expect(result.max).toBe(8);
        expect(result.maxLength).toBe(3);
    });

    it('should handle negative numbers', () => {
        const series = [{ name: 'A', data: [-10, 5, -3] }];
        const result = computeSeriesExtent(series);
        expect(result.min).toBe(-10);
        expect(result.max).toBe(5);
    });

    it('should handle series with different lengths', () => {
        const series = [
            { name: 'A', data: [1, 2] },
            { name: 'B', data: [3, 4, 5, 6] },
        ];
        const result = computeSeriesExtent(series);
        expect(result.maxLength).toBe(4);
    });

    it('should return default extent for empty series', () => {
        const result = computeSeriesExtent([]);
        expect(result.min).toBe(0);
        expect(result.max).toBe(0);
        expect(result.maxLength).toBe(0);
    });

    it('should handle single series with single data point', () => {
        const series = [{ name: 'A', data: [42] }];
        const result = computeSeriesExtent(series);
        expect(result.min).toBe(42);
        expect(result.max).toBe(42);
        expect(result.maxLength).toBe(1);
    });

    it('should handle series containing empty data', () => {
        const series = [{ name: 'A', data: [] }];
        const result = computeSeriesExtent(series);
        expect(result.min).toBe(0);
        expect(result.max).toBe(0);
        expect(result.maxLength).toBe(0);
    });
});

describe('defaultTickFormat', () => {
    it('should display integer for values less than 1000', () => {
        expect(defaultTickFormat(0)).toBe('0');
        expect(defaultTickFormat(42)).toBe('42');
        expect(defaultTickFormat(999)).toBe('999');
        expect(defaultTickFormat(123.456)).toBe('123');
    });

    it('should use k suffix for 1000-999999', () => {
        expect(defaultTickFormat(1000)).toBe('1k');
        expect(defaultTickFormat(1500)).toBe('1.5k');
        expect(defaultTickFormat(12000)).toBe('12k');
        expect(defaultTickFormat(999000)).toBe('999k');
    });

    it('should use m suffix for 1M-999M', () => {
        expect(defaultTickFormat(1_000_000)).toBe('1m');
        expect(defaultTickFormat(2_500_000)).toBe('2.5m');
        expect(defaultTickFormat(999_000_000)).toBe('999m');
    });

    it('should use b suffix for 1B+', () => {
        expect(defaultTickFormat(1_000_000_000)).toBe('1b');
        expect(defaultTickFormat(2_500_000_000)).toBe('2.5b');
        expect(defaultTickFormat(10_000_000_000)).toBe('10b');
    });

    it('should handle negative numbers', () => {
        expect(defaultTickFormat(-500)).toBe('-500');
        expect(defaultTickFormat(-1500)).toBe('-1.5k');
        expect(defaultTickFormat(-2_000_000)).toBe('-2m');
        expect(defaultTickFormat(-3_000_000_000)).toBe('-3b');
    });
});

describe('getYAxisLabelWidth', () => {
    it('should calculate maximum width of tick labels', () => {
        const width = getYAxisLabelWidth({
            min: 0,
            max: 100,
            tickCount: 5,
        });
        expect(width).toBeGreaterThan(0);
        expect(width).toBe(3); // "100" has length 3
    });

    it('should handle min === max boundary case', () => {
        const width = getYAxisLabelWidth({
            min: 50,
            max: 50,
            tickCount: 5,
        });
        expect(width).toBe(2); // "50" has length 2
    });

    it('should return 0 when tickCount <= 0', () => {
        expect(getYAxisLabelWidth({ min: 0, max: 100, tickCount: 0 })).toBe(0);
        expect(getYAxisLabelWidth({ min: 0, max: 100, tickCount: -1 })).toBe(0);
    });

    it('should use k/m/b suffixes for large values', () => {
        const width = getYAxisLabelWidth({
            min: 0,
            max: 10_000,
            tickCount: 5,
        });
        // ticks include: 0, 2.5k, 5k, 7.5k, 10k
        // "2.5k" and "7.5k" have length 4, which is the longest
        expect(width).toBe(4);
    });

    it('should support custom tickFormat', () => {
        const width = getYAxisLabelWidth({
            min: 0,
            max: 100,
            tickCount: 3,
            tickFormat: (v) => `${v}%`,
        });
        expect(width).toBe(4); // "100%" has length 4
    });
});

describe('computeBaselineY', () => {
    it('should place baseline at zero for cross-zero ranges', () => {
        const result = computeBaselineY({
            min: -10,
            max: 10,
            pixelHeight: 100,
        });
        // 0 maps to middle (50)
        expect(result).toBe(50);
    });

    it('should place baseline at min for all-positive ranges', () => {
        const result = computeBaselineY({
            min: 10,
            max: 100,
            pixelHeight: 100,
        });
        // baseline at min (10), which maps to bottom (99)
        expect(result).toBe(99);
    });

    it('should place baseline at max for all-negative ranges', () => {
        const result = computeBaselineY({
            min: -100,
            max: -10,
            pixelHeight: 100,
        });
        // baseline at max (-10), which maps to top (0)
        expect(result).toBe(0);
    });

    it('should handle min === max special case', () => {
        const result = computeBaselineY({
            min: 50,
            max: 50,
            pixelHeight: 100,
        });
        // Should return middle
        expect(result).toBe(50);
    });

    it('should place baseline at bottom when min is 0', () => {
        const result = computeBaselineY({
            min: 0,
            max: 100,
            pixelHeight: 100,
        });
        // 0 maps to bottom
        expect(result).toBe(99);
    });
});
