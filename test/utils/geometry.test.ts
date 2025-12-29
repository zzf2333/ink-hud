import { describe, expect, it } from 'vitest';
import {
    arcPoints,
    degreesToRadians,
    distanceBetweenPoints,
    midpointCircle,
    pointOnArc,
    radiansToDegrees,
} from '../../src/utils/geometry';

describe('midpointCircle', () => {
    it('should return symmetric points on the circle', () => {
        const points = midpointCircle(10, 10, 5);
        expect(points.length).toBeGreaterThan(0);
        // all points should be numeric pairs
        for (const [x, y] of points) {
            expect(typeof x).toBe('number');
            expect(typeof y).toBe('number');
        }
    });

    it('should return only the center when radius is 0', () => {
        const points = midpointCircle(5, 5, 0);
        // when radius is 0, all 8 symmetric points are at center
        expect(points.length).toBe(8);
        for (const [x, y] of points) {
            expect(x).toBe(5);
            expect(y).toBe(5);
        }
    });

    it('generated points should be symmetric about the center', () => {
        const centerX = 20;
        const centerY = 20;
        const points = midpointCircle(centerX, centerY, 10);

        // check if each point has a corresponding symmetric point
        for (const [x, y] of points) {
            const symmetricX = 2 * centerX - x;
            const symmetricY = 2 * centerY - y;
            const hasSymmetric = points.some(([px, py]) => px === symmetricX && py === symmetricY);
            expect(hasSymmetric).toBe(true);
        }
    });
});

describe('pointOnArc', () => {
    it('should calculate correct points on the arc', () => {
        // 0 degree angle (cos=1, sin=0)
        const [x1, y1] = pointOnArc(0, 0, 10, 0);
        expect(x1).toBeCloseTo(10);
        expect(y1).toBeCloseTo(0);

        // 90 degree angle (cos=0, sin=1)
        const [x2, y2] = pointOnArc(0, 0, 10, Math.PI / 2);
        expect(x2).toBeCloseTo(0);
        expect(y2).toBeCloseTo(10);

        // 180 degree angle (cos=-1, sin=0)
        const [x3, y3] = pointOnArc(0, 0, 10, Math.PI);
        expect(x3).toBeCloseTo(-10);
        expect(y3).toBeCloseTo(0);
    });

    it('should correctly apply center offset', () => {
        const [x, y] = pointOnArc(50, 50, 10, 0);
        expect(x).toBeCloseTo(60);
        expect(y).toBeCloseTo(50);
    });
});

describe('arcPoints', () => {
    it('should generate specified number of points on the arc', () => {
        const points = arcPoints(0, 0, 10, 0, Math.PI, 10);
        // steps + 1 points (including start and end)
        expect(points).toHaveLength(11);
    });

    it('start and end points should be correct', () => {
        const points = arcPoints(0, 0, 10, 0, Math.PI / 2, 4);

        // start point (0 degrees)
        expect(points[0][0]).toBeCloseTo(10);
        expect(points[0][1]).toBeCloseTo(0);

        // end point (90 degrees)
        expect(points[4][0]).toBeCloseTo(0);
        expect(points[4][1]).toBeCloseTo(10);
    });

    it('should handle reverse angles', () => {
        // when endAngle < startAngle, should auto swap
        const points = arcPoints(0, 0, 10, Math.PI, 0, 4);
        expect(points).toHaveLength(5);
    });

    it('should automatically calculate steps based on radius when steps not specified', () => {
        const points = arcPoints(0, 0, 20, 0, Math.PI);
        expect(points.length).toBeGreaterThan(10);
    });
});

describe('degreesToRadians', () => {
    it('should correctly convert degrees to radians', () => {
        expect(degreesToRadians(0)).toBe(0);
        expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
        expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
        expect(degreesToRadians(360)).toBeCloseTo(Math.PI * 2);
    });

    it('should handle negative numbers', () => {
        expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2);
    });
});

describe('radiansToDegrees', () => {
    it('should correctly convert radians to degrees', () => {
        expect(radiansToDegrees(0)).toBe(0);
        expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
        expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
        expect(radiansToDegrees(Math.PI * 2)).toBeCloseTo(360);
    });

    it('should handle negative numbers', () => {
        expect(radiansToDegrees(-Math.PI / 2)).toBeCloseTo(-90);
    });
});

describe('distanceBetweenPoints', () => {
    it('should correctly calculate distance between two points', () => {
        // 3-4-5 right triangle
        expect(distanceBetweenPoints(0, 0, 3, 4)).toBe(5);
        // horizontal distance
        expect(distanceBetweenPoints(0, 0, 10, 0)).toBe(10);
        // vertical distance
        expect(distanceBetweenPoints(0, 0, 0, 10)).toBe(10);
    });

    it('distance between the same point should be 0', () => {
        expect(distanceBetweenPoints(5, 5, 5, 5)).toBe(0);
    });

    it('should handle negative coordinates', () => {
        expect(distanceBetweenPoints(-3, -4, 0, 0)).toBe(5);
    });
});
