import { describe, expect, it } from 'vitest';
import {
    encodeKittyDelete,
    encodeKittyPlaceholders,
    encodeKittyUpload,
} from '../../src/render/image/kitty';

const TINY_PNG = Buffer.from(
    '89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c4944415478016360f8cf000001820181d0a8f600000000049454e44ae426082',
    'hex',
);

describe('encodeKittyUpload', () => {
    it('produces APC escape sequences', () => {
        const seq = encodeKittyUpload(TINY_PNG, 4, 2, 1);
        expect(seq).toContain('\x1b_G');
        expect(seq).toContain('\x1b\\');
    });

    it('first chunk includes a=T,U=1 and image ID', () => {
        const seq = encodeKittyUpload(TINY_PNG, 4, 2, 42);
        expect(seq).toMatch(/a=T,U=1,i=42/);
    });

    it('first chunk includes c= and r= dimensions', () => {
        const seq = encodeKittyUpload(TINY_PNG, 6, 3, 1);
        expect(seq).toMatch(/c=6,r=3/);
    });

    it('single-chunk PNG has m=0 (last chunk)', () => {
        const seq = encodeKittyUpload(TINY_PNG, 4, 2, 1);
        expect(seq).toMatch(/m=0/);
        // Should not have m=1 for a small PNG
        expect(seq).not.toMatch(/m=1/);
    });
});

describe('encodeKittyPlaceholders', () => {
    it('returns correct number of lines', () => {
        const result = encodeKittyPlaceholders(4, 3, 1);
        expect(result.split('\n')).toHaveLength(3);
    });

    it('encodes image ID as RGB foreground color', () => {
        // imageId=1 → R=0, G=0, B=1 → \x1b[38;2;0;0;1m
        const result = encodeKittyPlaceholders(2, 1, 1);
        expect(result).toContain('\x1b[38;2;0;0;1m');
    });

    it('encodes high image ID correctly', () => {
        // imageId=0x010203 → R=1, G=2, B=3
        const result = encodeKittyPlaceholders(2, 1, 0x010203);
        expect(result).toContain('\x1b[38;2;1;2;3m');
    });

    it('contains the Kitty placeholder codepoint U+10EEEE', () => {
        const result = encodeKittyPlaceholders(2, 1, 1);
        expect(result).toContain('\u{10EEEE}');
    });

    it('resets foreground color at end of each line', () => {
        const result = encodeKittyPlaceholders(2, 2, 1);
        const lines = result.split('\n');
        for (const line of lines) {
            expect(line).toContain('\x1b[39m');
        }
    });

    it('each line has cols placeholder groups', () => {
        const cols = 3;
        const result = encodeKittyPlaceholders(cols, 1, 1);
        const line = result.split('\n')[0] ?? '';
        // Count occurrences of U+10EEEE
        const count = [...line].filter((ch) => ch === '\u{10EEEE}').length;
        expect(count).toBe(cols);
    });
});

describe('encodeKittyPlaceholders — bounds checking', () => {
    it('accepts rows and cols up to 256', () => {
        expect(() => encodeKittyPlaceholders(256, 256, 1)).not.toThrow();
    });

    it('throws RangeError when rows > 256', () => {
        expect(() => encodeKittyPlaceholders(1, 257, 1)).toThrow(RangeError);
    });

    it('throws RangeError when cols > 256', () => {
        expect(() => encodeKittyPlaceholders(257, 1, 1)).toThrow(RangeError);
    });

    it('error message mentions the offending dimension', () => {
        expect(() => encodeKittyPlaceholders(300, 1, 1)).toThrow(/300/);
    });
});

describe('encodeKittyPlaceholders — trailingSpace option', () => {
    it('default (trailingSpace=true) adds a space after each placeholder', () => {
        const result = encodeKittyPlaceholders(2, 1, 1);
        // Each cell: U+10EEEE + rowMark + colMark + ' ' — count spaces between placeholders
        // biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally matches ANSI ESC sequences
        const line = result.split('\n')[0]?.replace(/\x1b\[[^m]*m/g, '');
        expect(line).toContain(' ');
    });

    it('trailingSpace=false omits the trailing space', () => {
        const withSpace = encodeKittyPlaceholders(2, 1, 1);
        const withoutSpace = encodeKittyPlaceholders(2, 1, 1, { trailingSpace: false });
        // Strip ANSI codes for comparison
        // biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally matches ANSI ESC sequences
        const strip = (s: string) => s.replace(/\x1b\[[^m]*m/g, '');
        expect(strip(withoutSpace).length).toBeLessThan(strip(withSpace).length);
    });

    it('trailingSpace=false still contains U+10EEEE placeholders', () => {
        const result = encodeKittyPlaceholders(3, 2, 1, { trailingSpace: false });
        const count = [...result].filter((ch) => ch === '\u{10EEEE}').length;
        expect(count).toBe(6); // 3 cols × 2 rows
    });
});

describe('encodeKittyDelete', () => {
    it('produces correct delete sequence', () => {
        expect(encodeKittyDelete(7)).toBe('\x1b_Ga=d,d=I,i=7\x1b\\');
    });

    it('uses the provided image ID', () => {
        expect(encodeKittyDelete(1234)).toContain('i=1234');
    });
});
