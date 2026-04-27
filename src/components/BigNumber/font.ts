/**
 * Multi-Style Big Fonts for BigNumber Component
 *
 * Supports two rendering styles:
 * - block: Unicode Block Elements (█▀▄)
 * - braille: Braille patterns (⠿)
 */

export type FontStyle = 'block' | 'braille';

// ============================================================
// Block Elements Font (3x3 character matrix)
// ============================================================

const BLOCK_FONT: Record<string, string[]> = {
    '0': ['█▀█', '█ █', '█▄█'],
    '1': [' █ ', ' █ ', ' █ '],
    '2': ['▀▀█', ' ▀▄', '█▄▄'],
    '3': ['▀▀█', ' ▀▄', '▄▄█'],
    '4': ['█ █', '█▄█', '  █'],
    '5': ['█▀▀', '▀▀▄', '▄▄█'],
    '6': ['█▀▀', '█▄▄', '█▄█'],
    '7': ['▀▀█', '  █', '  █'],
    '8': ['█▀█', '█▀█', '█▄█'],
    '9': ['█▀█', '▀▀█', '  █'],
    '.': ['   ', '   ', ' ▄ '],
    ',': ['   ', '   ', ' ▙ '],
    '%': ['█  ', ' █ ', '  █'],
    '+': ['   ', ' ┼ ', '   '],
    '-': ['   ', ' ─ ', '   '],
};

// ============================================================
// Braille Font (3x3 character matrix using Braille dots)
// ============================================================

const BRAILLE_FONT: Record<string, string[]> = {
    '0': ['⣰⣆', '⡇⢸', '⠙⠛'],
    '1': ['⢀⡆', '⠀⡇', '⠀⠇'],
    '2': ['⠤⣤', '⢀⡤', '⠓⠒'],
    '3': ['⠤⣤', '⠀⡤', '⠒⠚'],
    '4': ['⡆⢸', '⠓⢺', '⠀⢸'],
    '5': ['⠖⠶', '⠒⢲', '⠒⠚'],
    '6': ['⢰⡆', '⠖⢲', '⠓⠚'],
    '7': ['⠤⣤', '⠀⡰', '⠀⡇'],
    '8': ['⢰⡆', '⠖⡶', '⠓⠚'],
    '9': ['⢰⡆', '⠓⢺', '⠀⢸'],
    '.': ['⠀⠀', '⠀⠀', '⠀⠄'],
    ',': ['⠀⠀', '⠀⠀', '⠀⠢'],
    '%': ['⠁⠀', '⠀⠂', '⠀⠈'],
    '+': ['⠀⠀', '⠐⠒', '⠀⠀'],
    '-': ['⠀⠀', '⠐⠒', '⠀⠀'],
};

// ============================================================
// Font Registry
// ============================================================

const FONTS: Record<FontStyle, Record<string, string[]>> = {
    block: BLOCK_FONT,
    braille: BRAILLE_FONT,
};

const UNKNOWN: Record<FontStyle, string[]> = {
    block: ['   ', ' ? ', '   '],
    braille: ['⠀⠀', '⠀⠦', '⠀⠀'],
};

// ============================================================
// Dev-mode warn for unsupported characters
// ============================================================

const warnedChars = new Set<string>();

function warnUnsupportedChar(char: string, style: FontStyle): void {
    if (process.env.NODE_ENV === 'production') return;
    const key = `${style}:${char}`;
    if (warnedChars.has(key)) return;
    warnedChars.add(key);
    console.warn(
        `[ink-hud] BigNumber: unsupported char "${char}" (style="${style}") rendered as "?". Use the prefix/suffix props for units or symbols (e.g. <BigNumber value="49" suffix="ms" />).`,
    );
}

// ============================================================
// Public API
// ============================================================

export function getBigChar(char: string, style: FontStyle = 'block'): string[] {
    const glyphs = FONTS[style][char];
    if (!glyphs) {
        warnUnsupportedChar(char, style);
        return UNKNOWN[style];
    }
    return glyphs;
}

export function renderBigString(text: string, style: FontStyle = 'block'): string[] {
    const rows = ['', '', ''];
    for (const char of text) {
        const matrix = getBigChar(char, style);
        rows[0] += `${matrix[0]} `;
        rows[1] += `${matrix[1]} `;
        rows[2] += `${matrix[2]} `;
    }
    return rows;
}
