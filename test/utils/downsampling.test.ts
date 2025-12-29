import { describe, expect, it } from 'vitest';
import {
    averageDownsampling,
    fixedIntervalDownsampling,
    lttb,
    minMaxDownsampling,
} from '../../src/utils/downsampling';

describe('downsampling', () => {
    describe('lttb', () => {
        it('should return original array reference when data size is less than or equal to threshold', () => {
            const data = [1, 2, 3];
            expect(lttb(data, 3)).toBe(data);
            expect(lttb(data, 10)).toBe(data);
        });

        it('should retain at least start and end points when threshold <= 2', () => {
            expect(lttb([10, 20, 30, 40], 2)).toEqual([10, 40]);
            expect(lttb([10, 20, 30, 40], 1)).toEqual([10, 40]);
        });

        it('should return specified number of data points and retain start and end values', () => {
            const data = Array.from({ length: 100 }, (_, i) => i);
            const sampled = lttb(data, 10);
            expect(sampled).toHaveLength(10);
            expect(sampled[0]).toBe(0);
            expect(sampled[sampled.length - 1]).toBe(99);
        });

        it('should retain points near peaks (simple waveform data)', () => {
            const data = [0, 1, 2, 10, 2, 1, 0];
            const sampled = lttb(data, 5);
            expect(sampled).toHaveLength(5);
            expect(sampled).toContain(10);
        });
    });

    describe('fixedIntervalDownsampling', () => {
        it('should sample at fixed intervals and include start and end points', () => {
            const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            // step = 2.25 -> indices [0, 2, 5, 7, 9]
            expect(fixedIntervalDownsampling(data, 5)).toEqual([1, 3, 6, 8, 10]);
        });

        it('should return original array reference when data size is less than or equal to threshold', () => {
            const data = [1, 2, 3];
            expect(fixedIntervalDownsampling(data, 3)).toBe(data);
        });
    });

    describe('averageDownsampling', () => {
        it('should average downsample by bucket to specify quantity', () => {
            const data = [1, 2, 3, 4, 5, 6, 7, 8];
            expect(averageDownsampling(data, 4)).toEqual([1.5, 3.5, 5.5, 7.5]);
        });
    });

    describe('minMaxDownsampling', () => {
        it('should output min and max values in each bucket (length approx. threshold * 2)', () => {
            const data = [1, 5, 2, 8, 3, 6, 4, 7];
            const sampled = minMaxDownsampling(data, 4);
            expect(sampled).toHaveLength(8);
            expect(sampled).toEqual([1, 5, 2, 8, 3, 6, 4, 7]);
        });
    });
});
