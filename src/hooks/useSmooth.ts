/**
 * Data smooth transition Hook module
 *
 * Provides smooth animation effects for data changes
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Quadratic easing function (accelerate then decelerate)
 * @param t - Progress (0-1)
 * @returns Eased progress (0-1)
 */
export function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Linear easing function (constant speed)
 * @param t - Progress (0-1)
 * @returns Eased progress (0-1)
 */
export function easeLinear(t: number): number {
    return t;
}

/**
 * Cubic ease-out function (decelerate)
 * @param t - Progress (0-1)
 * @returns Eased progress (0-1)
 */
export function easeOutCubic(t: number): number {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
}

/**
 * Cubic ease-in function (accelerate)
 * @param t - Progress (0-1)
 * @returns Eased progress (0-1)
 */
export function easeInCubic(t: number): number {
    return t * t * t;
}

/**
 * Data smooth transition Hook
 * Smooth transition to new value when target changes
 *
 * @param targetValue - Target value
 * @param duration - Transition duration (ms, default 300)
 * @param easingFn - Easing function (default easeInOutQuad)
 * @returns Current smooth value
 *
 * @example
 * const smoothValue = useSmooth(cpuUsage, 500);
 * return <LineChart series={[{ name: 'Value', data: [smoothValue] }]} />;
 */
export function useSmooth(
    targetValue: number,
    duration = 300,
    easingFn: EasingFunction = easeInOutQuad,
): number {
    const [currentValue, setCurrentValue] = useState(targetValue);
    const startValueRef = useRef(targetValue);
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // If target value hasn't changed, no animation needed
        if (targetValue === currentValue) {
            return;
        }

        startValueRef.current = currentValue;
        startTimeRef.current = Date.now();

        const frameInterval = 1000 / 30; // 30 FPS

        const animate = () => {
            const now = Date.now();
            const elapsed = now - (startTimeRef.current ?? now);
            const progress = Math.min(elapsed / duration, 1);

            const easedProgress = easingFn(progress);
            const newValue =
                startValueRef.current + (targetValue - startValueRef.current) * easedProgress;

            setCurrentValue(newValue);

            if (progress < 1) {
                timerRef.current = setTimeout(animate, frameInterval);
            }
        };

        timerRef.current = setTimeout(animate, frameInterval);

        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        };
    }, [targetValue, duration, easingFn, currentValue]);

    return currentValue;
}

/**
 * Array data smooth transition Hook
 * Smooth transition to new data when target changes
 *
 * @param targetData - Target data array
 * @param duration - Transition duration (ms, default 300)
 * @param easingFn - Easing function (default easeInOutQuad)
 * @returns Current smooth data array
 *
 * @example
 * const smoothData = useSmoothArray(memoryData, 500);
 * return <LineChart data={[{ name: 'Memory', data: smoothData }]} />;
 */
export function useSmoothArray(
    targetData: number[],
    duration = 300,
    easingFn: EasingFunction = easeInOutQuad,
): number[] {
    const [currentData, setCurrentData] = useState(targetData);
    const startDataRef = useRef(targetData);
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // If data length changes, use new data directly (no smoothing)
        if (targetData.length !== currentData.length) {
            setCurrentData(targetData);
            return;
        }

        // If data hasn't changed, no animation needed
        const hasChanged = targetData.some((value, i) => value !== currentData[i]);
        if (!hasChanged) {
            return;
        }

        startDataRef.current = currentData;
        startTimeRef.current = Date.now();

        const frameInterval = 1000 / 30; // 30 FPS

        const animate = () => {
            const now = Date.now();
            const elapsed = now - (startTimeRef.current ?? now);
            const progress = Math.min(elapsed / duration, 1);

            const easedProgress = easingFn(progress);
            const newData = targetData.map((target, i) => {
                const start = startDataRef.current[i] ?? 0;
                return start + (target - start) * easedProgress;
            });

            setCurrentData(newData);

            if (progress < 1) {
                timerRef.current = setTimeout(animate, frameInterval);
            }
        };

        timerRef.current = setTimeout(animate, frameInterval);

        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        };
    }, [targetData, duration, easingFn, currentData]);

    return currentData;
}

/**
 * Throttling Hook
 * Limit animation frame rate to avoid terminal flicker
 *
 * @param value - Current value
 * @param fps - Target frame rate (default 30)
 * @returns Throttled value
 *
 * @example
 * const throttledValue = useThrottle(cpuUsage, 30);
 */
export function useThrottle<T>(value: T, fps = 30): T {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastUpdateRef = useRef(Date.now());

    useEffect(() => {
        const now = Date.now();
        const interval = 1000 / fps;
        const elapsed = now - lastUpdateRef.current;

        if (elapsed >= interval) {
            setThrottledValue(value);
            lastUpdateRef.current = now;
            return;
        }

        const timeoutId = setTimeout(() => {
            setThrottledValue(value);
            lastUpdateRef.current = Date.now();
        }, interval - elapsed);

        return () => clearTimeout(timeoutId);
    }, [value, fps]);

    return throttledValue;
}
