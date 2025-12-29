/**
 * Data downsampling module
 *
 * Provides downsampling algorithms for large datasets to display many data points in limited-width charts
 */

function computeAveragePoint(
    data: number[],
    startIndexInclusive: number,
    endIndexExclusive: number,
): { x: number; y: number } {
    const count = endIndexExclusive - startIndexInclusive;
    if (count <= 0) {
        return { x: 0, y: 0 };
    }

    let sumX = 0;
    let sumY = 0;
    for (let i = startIndexInclusive; i < endIndexExclusive; i++) {
        sumX += i;
        sumY += data[i] ?? 0;
    }

    return { x: sumX / count, y: sumY / count };
}

function triangleArea(
    prevX: number,
    prevY: number,
    avgX: number,
    avgY: number,
    pointX: number,
    pointY: number,
): number {
    return Math.abs((prevX - avgX) * (pointY - prevY) - (prevX - pointX) * (avgY - prevY));
}

function findLargestTrianglePointIndex(
    data: number[],
    bucketStart: number,
    bucketEnd: number,
    prevX: number,
    prevY: number,
    avgX: number,
    avgY: number,
): number {
    let maxArea = -1;
    let maxIdx = bucketStart;

    for (let i = bucketStart; i < bucketEnd; i++) {
        const area = triangleArea(prevX, prevY, avgX, avgY, i, data[i] ?? 0);
        if (area > maxArea) {
            maxArea = area;
            maxIdx = i;
        }
    }

    return maxIdx;
}

/**
 * LTTB (Largest Triangle Three Buckets) algorithm
 * An efficient data downsampling algorithm that preserves visually important data points
 *
 * Algorithm principles:
 * 1. Always preserve first and last points
 * 2. Divide intermediate data into multiple buckets
 * 3. Select the point with largest triangle area in each bucket (forming largest triangle with adjacent points)
 *
 * @param data - Original data array
 * @param threshold - Target number of data points
 * @returns Downsampled data array
 *
 * @example
 * const data = Array.from({ length: 1000 }, (_, i) => Math.sin(i / 10));
 * const sampled = lttb(data, 100); // Downsample from 1000 points to 100 points
 */
export function lttb(data: number[], threshold: number): number[] {
    // If number of data points is less than or equal to threshold, return directly
    if (data.length <= threshold) {
        return data;
    }

    // If threshold is too small, at least preserve first and last points
    if (threshold <= 2) {
        return [data[0] ?? 0, data[data.length - 1] ?? 0];
    }

    const sampled: number[] = [data[0] ?? 0]; // Always preserve the first point
    let prevIndex = 0;

    // Calculate bucket size
    const bucketSize = (data.length - 2) / (threshold - 2);

    // Iterate through buckets
    for (let i = 0; i < threshold - 2; i++) {
        // Start and end indices of current bucket
        const bucketStart = Math.floor(i * bucketSize) + 1;
        const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;

        // Center point of the next bucket (for triangle calculation)
        const nextBucketStart = bucketEnd;
        const nextBucketEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);

        // Calculate average point of next bucket (as third vertex of triangle)
        const { x: avgX, y: avgY } = computeAveragePoint(data, nextBucketStart, nextBucketEnd);

        // Previously selected point
        const prevX = prevIndex;
        const prevY = data[prevIndex] ?? 0;

        const maxIdx = findLargestTrianglePointIndex(
            data,
            bucketStart,
            bucketEnd,
            prevX,
            prevY,
            avgX,
            avgY,
        );

        sampled.push(data[maxIdx] ?? 0);
        prevIndex = maxIdx;
    }

    // Always preserve the last point
    sampled.push(data[data.length - 1] ?? 0);

    return sampled;
}

/**
 * Simple fixed-interval downsampling
 * Select one data point at fixed intervals
 *
 * @param data - Original data array
 * @param threshold - Target number of data points
 * @returns Downsampled data array
 *
 * @example
 * const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * const sampled = fixedIntervalDownsampling(data, 5); // [1, 3, 5, 7, 10]
 */
export function fixedIntervalDownsampling(data: number[], threshold: number): number[] {
    if (data.length <= threshold) {
        return data;
    }

    const sampled: number[] = [];
    const step = (data.length - 1) / (threshold - 1);

    for (let i = 0; i < threshold; i++) {
        const index = Math.round(i * step);
        sampled.push(data[index] ?? 0);
    }

    return sampled;
}

/**
 * Average Downsampling
 * Divide data into multiple buckets, taking the average value for each bucket
 *
 * @param data - Original data array
 * @param threshold - Target number of data points
 * @returns Downsampled data array
 *
 * @example
 * const data = [1, 2, 3, 4, 5, 6, 7, 8];
 * const sampled = averageDownsampling(data, 4); // [1.5, 3.5, 5.5, 7.5]
 */
export function averageDownsampling(data: number[], threshold: number): number[] {
    if (data.length <= threshold) {
        return data;
    }

    const sampled: number[] = [];
    const bucketSize = data.length / threshold;

    for (let i = 0; i < threshold; i++) {
        const bucketStart = Math.floor(i * bucketSize);
        const bucketEnd = Math.floor((i + 1) * bucketSize);

        let sum = 0;
        let count = 0;

        for (let j = bucketStart; j < bucketEnd; j++) {
            sum += data[j] ?? 0;
            count++;
        }

        sampled.push(count > 0 ? sum / count : 0);
    }

    return sampled;
}

/**
 * Min-Max Downsampling
 * Divide data into multiple buckets, preserving the Maximum and Minimum values for each bucket
 * Suitable for preserving peaks and valleys in data
 *
 * @param data - Original data array
 * @param threshold - Target number of data points (actual returned points will be 2x threshold)
 * @returns Downsampled data array
 *
 * @example
 * const data = [1, 5, 2, 8, 3, 6, 4, 7];
 * const sampled = minMaxDownsampling(data, 4); // [1, 5, 2, 8, 3, 6, 4, 7]
 */
export function minMaxDownsampling(data: number[], threshold: number): number[] {
    if (data.length <= threshold) {
        return data;
    }

    const sampled: number[] = [];
    const bucketSize = data.length / threshold;

    for (let i = 0; i < threshold; i++) {
        const bucketStart = Math.floor(i * bucketSize);
        const bucketEnd = Math.floor((i + 1) * bucketSize);

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        for (let j = bucketStart; j < bucketEnd; j++) {
            const value = data[j] ?? 0;
            if (value < min) min = value;
            if (value > max) max = value;
        }

        // Preserve Minimum and Maximum values
        sampled.push(min, max);
    }

    return sampled;
}
