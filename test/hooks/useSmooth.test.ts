import { describe, expect, it } from 'vitest';
import {
    easeInCubic,
    easeInOutQuad,
    easeLinear,
    easeOutCubic,
} from '../../src/hooks/useSmooth';

describe('easeLinear', () => {
    it('should return linear values', () => {
        expect(easeLinear(0)).toBe(0);
        expect(easeLinear(0.25)).toBe(0.25);
        expect(easeLinear(0.5)).toBe(0.5);
        expect(easeLinear(0.75)).toBe(0.75);
        expect(easeLinear(1)).toBe(1);
    });
});

describe('easeInOutQuad', () => {
    it('boundary values should be correct', () => {
        expect(easeInOutQuad(0)).toBe(0);
        expect(easeInOutQuad(1)).toBe(1);
    });

    it('midpoint should be 0.5', () => {
        expect(easeInOutQuad(0.5)).toBe(0.5);
    });

    it('first half should accelerate (less than linear)', () => {
        expect(easeInOutQuad(0.25)).toBeLessThan(0.25);
    });

    it('second half should decelerate (greater than linear)', () => {
        expect(easeInOutQuad(0.75)).toBeGreaterThan(0.75);
    });
});

describe('easeOutCubic', () => {
    it('boundary values should be correct', () => {
        expect(easeOutCubic(0)).toBe(0);
        expect(easeOutCubic(1)).toBe(1);
    });

    it('should decelerate (greater than linear)', () => {
        expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
    });
});

describe('easeInCubic', () => {
    it('boundary values should be correct', () => {
        expect(easeInCubic(0)).toBe(0);
        expect(easeInCubic(1)).toBe(1);
    });

    it('should accelerate (less than linear)', () => {
        expect(easeInCubic(0.5)).toBeLessThan(0.5);
    });
});
