/**
 * Multi-Style Big Fonts for BigNumber Component
 *
 * Supports three rendering styles:
 * - block: Unicode Block Elements (█▀▄)
 * - braille: Braille patterns (⠿)
 * - ascii: Pure ASCII characters
 */

export type FontStyle = 'block' | 'braille' | 'ascii';

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
// ASCII Font (3x3 character matrix, pure ASCII)
// ============================================================

const ASCII_FONT: Record<string, string[]> = {
    '0': ['+~+', '| |', '+~+'],
    '1': [' | ', ' | ', ' | '],
    '2': ['~~+', '+-+', '+~~'],
    '3': ['~~+', ' ~+', '~~+'],
    '4': ['+ +', '+-+', '  +'],
    '5': ['+~~', '+~+', '~~+'],
    '6': ['+~~', '+~+', '+~+'],
    '7': ['~~+', '  +', '  +'],
    '8': ['+~+', '+~+', '+~+'],
    '9': ['+~+', '+~+', '  +'],
    '.': ['   ', '   ', ' . '],
    ',': ['   ', '   ', ' , '],
    '%': ['*  ', ' * ', '  *'],
    '+': ['   ', ' + ', '   '],
    '-': ['   ', ' - ', '   '],
};

// ============================================================
// Font Registry
// ============================================================

const FONTS: Record<FontStyle, Record<string, string[]>> = {
    block: BLOCK_FONT,
    braille: BRAILLE_FONT,
    ascii: ASCII_FONT,
};

const UNKNOWN: Record<FontStyle, string[]> = {
    block: ['   ', ' ? ', '   '],
    braille: ['⠀⠀', '⠀⠦', '⠀⠀'],
    ascii: ['   ', ' ? ', '   '],
};

// ============================================================
// Public API
// ============================================================

export function getBigChar(char: string, style: FontStyle = 'block'): string[] {
    return FONTS[style][char] || UNKNOWN[style];
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
