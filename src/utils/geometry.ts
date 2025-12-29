/**
 * Geometry calculation utility module
 *
 * Provides helper functions for calculating geometric shapes like circles and arcs
 */

/**
 * Midpoint Circle Algorithm
 * Calculate all points on the circle (8 symmetry points)
 *
 * @param centerX - Center x coordinate
 * @param centerY - Center y coordinate
 * @param radius - Radius
 * @returns Array of coordinates for all points on circle
 *
 * @example
 * const points = midpointCircle(50, 50, 20);
 * points.forEach(([x, y]) => {
 *     console.log(`Point coordinates: (${x}, ${y})`);
 * });
 */
export function midpointCircle(
    centerX: number,
    centerY: number,
    radius: number,
): Array<[number, number]> {
    const points: Array<[number, number]> = [];

    let x = 0;
    let y = radius;
    let d = 1 - radius;

    while (x <= y) {
        // 8 symmetry points
        points.push(
            [centerX + x, centerY + y],
            [centerX - x, centerY + y],
            [centerX + x, centerY - y],
            [centerX - x, centerY - y],
            [centerX + y, centerY + x],
            [centerX - y, centerY + x],
            [centerX + y, centerY - x],
            [centerX - y, centerY - x],
        );

        x++;
        if (d < 0) {
            d += 2 * x + 1;
        } else {
            y--;
            d += 2 * (x - y) + 1;
        }
    }

    return points;
}

/**
 * Calculate point coordinates at specified angle on arc
 * Using parametric equations: x = centerX + r * cos(θ), y = centerY + r * sin(θ)
 *
 * @param centerX - Center x coordinate
 * @param centerY - Center y coordinate
 * @param radius - Radius
 * @param angle - Angle (radians)
 * @returns Point coordinates [x, y]
 *
 * @example
 * // Calculate the point at 45° (π/4 radians)
 * const [x, y] = pointOnArc(50, 50, 20, Math.PI / 4);
 */
export function pointOnArc(
    centerX: number,
    centerY: number,
    radius: number,
    angle: number,
): [number, number] {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return [x, y];
}

/**
 * Calculate multiple points on the arc
 *
 * @param centerX - Center x coordinate
 * @param centerY - Center y coordinate
 * @param radius - Radius
 * @param startAngle - Start angle (radians)
 * @param endAngle - End angle (radians)
 * @param steps - Steps (default calculated based on radius)
 * @returns Array of coordinates for all points on arc
 *
 * @example
 * // Calculate arc points from 0° to 90°
 * const points = arcPoints(50, 50, 20, 0, Math.PI / 2, 20);
 */
export function arcPoints(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    steps?: number,
): Array<[number, number]> {
    const points: Array<[number, number]> = [];

    // Ensure correct angle order
    let start = startAngle;
    let end = endAngle;
    if (start > end) {
        [start, end] = [end, start];
    }

    // Calculate number of steps (default based on radius and angle range)
    const angleRange = end - start;
    const stepCount = steps ?? Math.max(10, Math.ceil(radius * angleRange));

    // Calculate angle step
    const angleStep = angleRange / stepCount;

    for (let i = 0; i <= stepCount; i++) {
        const angle = start + i * angleStep;
        points.push(pointOnArc(centerX, centerY, radius, angle));
    }

    return points;
}

/**
 * Convert angle from degrees to radians
 *
 * @param degrees - Angle (degrees)
 * @returns Angle (radians)
 *
 * @example
 * const radians = degreesToRadians(90); // π/2
 */
export function degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Convert angle from radians to degrees
 *
 * @param radians - Angle (radians)
 * @returns Angle (degrees)
 *
 * @example
 * const degrees = radiansToDegrees(Math.PI / 2); // 90
 */
export function radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}

/**
 * Calculate distance between two points
 *
 * @param x1 - First point x coordinate
 * @param y1 - First point y coordinate
 * @param x2 - Second point x coordinate
 * @param y2 - Second point y coordinate
 * @returns Distance
 *
 * @example
 * const distance = distanceBetweenPoints(0, 0, 3, 4); // 5
 */
export function distanceBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
