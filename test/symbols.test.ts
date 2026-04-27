import { describe, expect, it } from 'vitest';
import { BAR, BORDER_ROUNDED, HEATMAP, LEGEND, SPARK_LEVELS, TREND } from '../src/symbols';

describe('SPARK_LEVELS', () => {
    it('block has 8 levels', () => {
        expect(SPARK_LEVELS.block).toHaveLength(8);
    });

    it('braille has 9 levels', () => {
        expect(SPARK_LEVELS.braille).toHaveLength(9);
    });
});

describe('TREND', () => {
    it('all entries are single characters', () => {
        expect([...TREND.up]).toHaveLength(1);
        expect([...TREND.down]).toHaveLength(1);
        expect([...TREND.neutral]).toHaveLength(1);
    });
});

describe('BORDER_ROUNDED', () => {
    it('has all 7 keys', () => {
        const keys = [
            'topLeft',
            'topRight',
            'bottomLeft',
            'bottomRight',
            'horizontal',
            'vertical',
            'bar',
        ];
        for (const key of keys) {
            expect(BORDER_ROUNDED).toHaveProperty(key);
        }
    });
});

describe('LEGEND, BAR, HEATMAP', () => {
    it('dot is a single character', () => {
        expect([...LEGEND.dot]).toHaveLength(1);
    });

    it('BAR fill and empty are single characters', () => {
        expect([...BAR.fill]).toHaveLength(1);
        expect([...BAR.empty]).toHaveLength(1);
    });

    it('HEATMAP default is a single character', () => {
        expect([...HEATMAP.default]).toHaveLength(1);
    });
});
