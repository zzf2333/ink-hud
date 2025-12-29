/**
 * Data scaling utility module
 *
 * Provides data normalization and linear scaling functions for mapping data to chart coordinate space
 */

/**
 * Linear scale function
 * Map value from input domain to output domain
 *
 * @param value - Value to scale
 * @param domain - Input domain [min, max]
 * @param range - Output range [min, max]
 * @returns Scaled value
 *
 * @example
 * linearScale(50, [0, 100], [0, 10]); // Returns 5
 * linearScale(75, [0, 100], [0, 20]); // Returns 15
 */
export function linearScale(
    value: number,
    domain: [number, number],
    range: [number, number],
): number {
    const [domainMin, domainMax] = domain;
    const [rangeMin, rangeMax] = range;

    // Handle case where domain range is 0
    if (domainMax === domainMin) {
        return rangeMin;
    }

    // Linear mapping formula: y = (x - x_min) / (x_max - x_min) * (y_max - y_min) + y_min
    const ratio = (value - domainMin) / (domainMax - domainMin);
    return ratio * (rangeMax - rangeMin) + rangeMin;
}

/**
 * Data normalization
 * Map array data to [0, 1] interval
 *
 * @param data - Original data array
 * @returns Normalized data array
 *
 * @example
 * normalize([0, 50, 100]); // Returns [0, 0.5, 1]
 * normalize([10, 20, 30]); // Returns [0, 0.5, 1]
 */
export function normalize(data: number[]): number[] {
    if (data.length === 0) {
        return [];
    }

    const min = Math.min(...data);
    const max = Math.max(...data);

    // If all values are same, return 0.5 for all (middle value)
    if (max === min) {
        return data.map(() => 0.5);
    }

    return data.map((value) => linearScale(value, [min, max], [0, 1]));
}

/**
 * Scale data to specified range
 * Map array data to specified output range
 *
 * @param data - Original data array
 * @param range - Output range [min, max]
 * @returns Scaled data array
 *
 * @example
 * scaleToRange([0, 50, 100], [0, 10]); // Returns [0, 5, 10]
 * scaleToRange([-10, 0, 10], [0, 100]); // Returns [0, 50, 100]
 */
export function scaleToRange(data: number[], range: [number, number]): number[] {
    if (data.length === 0) {
        return [];
    }

    const min = Math.min(...data);
    const max = Math.max(...data);

    // If all values are same, return the range midpoint
    if (max === min) {
        const midPoint = (range[0] + range[1]) / 2;
        return data.map(() => midPoint);
    }

    return data.map((value) => linearScale(value, [min, max], range));
}

/**
 * Clamp value within specified range (clamp)
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 *
 * @example
 * clamp(5, 0, 10); // Returns 5
 * clamp(-5, 0, 10); // Returns 0
 * clamp(15, 0, 10); // Returns 10
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
