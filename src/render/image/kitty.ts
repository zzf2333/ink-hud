/**
 * Kitty Graphics Protocol encoder
 *
 * Spec: https://sw.kovidgoyal.net/kitty/graphics-protocol/
 */

const CHUNK_SIZE = 4096;

/**
 * Combining diacritical marks used to encode row/col indices in Unicode Placeholder mode.
 * Each index maps to a zero-width combining character (string-width = 0).
 * Spec: https://sw.kovidgoyal.net/kitty/graphics-protocol/#unicode-placeholders
 */
// Full set of combining diacritical marks valid for Kitty Unicode Placeholder mode.
// Source: https://sw.kovidgoyal.net/kitty/graphics-protocol/#unicode-placeholders
// 256 entries — supports grids up to 256×256 cells (≫ any realistic terminal size).
const DIACRITICS = [
    // 0–99 (original set)
    0x0305, 0x030d, 0x030e, 0x0310, 0x0312, 0x033d, 0x033e, 0x033f, 0x0346, 0x034a, 0x034b, 0x034c,
    0x0350, 0x0351, 0x0352, 0x0357, 0x035b, 0x0363, 0x0364, 0x0365, 0x0366, 0x0367, 0x0368, 0x0369,
    0x036a, 0x036b, 0x036c, 0x036d, 0x036e, 0x036f, 0x0483, 0x0484, 0x0485, 0x0486, 0x0487, 0x0592,
    0x0593, 0x0594, 0x0595, 0x0597, 0x0598, 0x0599, 0x059c, 0x059d, 0x059e, 0x059f, 0x05a0, 0x05a1,
    0x05a8, 0x05a9, 0x05ab, 0x05ac, 0x05af, 0x05c4, 0x0610, 0x0611, 0x0612, 0x0613, 0x0614, 0x0615,
    0x0616, 0x0617, 0x0657, 0x0658, 0x0659, 0x065a, 0x065b, 0x065d, 0x065e, 0x06d6, 0x06d7, 0x06d8,
    0x06d9, 0x06da, 0x06db, 0x06dc, 0x06df, 0x06e0, 0x06e1, 0x06e2, 0x06e4, 0x06e7, 0x06e8, 0x06eb,
    0x06ec, 0x0730, 0x0732, 0x0733, 0x0735, 0x0736, 0x073a, 0x073d, 0x073f, 0x0740, 0x0741, 0x0743,
    0x0745, 0x0747, 0x0749, 0x074a,
    // 100–107
    0x07eb, 0x07ec, 0x07ed, 0x07ee, 0x07ef, 0x07f0, 0x07f1, 0x07f3,
    // 108–128
    0x0816, 0x0817, 0x0818, 0x0819, 0x081b, 0x081c, 0x081d, 0x081e, 0x081f, 0x0820, 0x0821, 0x0822,
    0x0823, 0x0825, 0x0826, 0x0827, 0x0829, 0x082a, 0x082b, 0x082c, 0x082d,
    // 129–131
    0x0951, 0x0953, 0x0954,
    // 132–135
    0x0f82, 0x0f83, 0x0f86, 0x0f87,
    // 136–138
    0x135d, 0x135e, 0x135f,
    // 139
    0x17dd,
    // 140
    0x193a,
    // 141–149
    0x1a17, 0x1a75, 0x1a76, 0x1a77, 0x1a78, 0x1a79, 0x1a7a, 0x1a7b, 0x1a7c,
    // 150–158
    0x1b6b, 0x1b6c, 0x1b6d, 0x1b6e, 0x1b6f, 0x1b70, 0x1b71, 0x1b72, 0x1b73,
    // 159–173
    0x1cd0, 0x1cd1, 0x1cd2, 0x1cda, 0x1cdb, 0x1ce0, 0x1ce1, 0x1ce2, 0x1ce3, 0x1ce4, 0x1ce5, 0x1ce6,
    0x1ce7, 0x1ce8, 0x1ced,
    // 174–176
    0x1cf4, 0x1cf8, 0x1cf9,
    // 177–187
    0x1dc0, 0x1dc1, 0x1dc3, 0x1dc4, 0x1dc5, 0x1dc6, 0x1dc7, 0x1dc8, 0x1dc9, 0x1dcb, 0x1dcc,
    // 188–210
    0x1dd1, 0x1dd2, 0x1dd3, 0x1dd4, 0x1dd5, 0x1dd6, 0x1dd7, 0x1dd8, 0x1dd9, 0x1dda, 0x1ddb, 0x1ddc,
    0x1ddd, 0x1dde, 0x1ddf, 0x1de0, 0x1de1, 0x1de2, 0x1de3, 0x1de4, 0x1de5, 0x1de6, 0x1dfe,
    // 211–222
    0x20d0, 0x20d1, 0x20d4, 0x20d5, 0x20d6, 0x20d7, 0x20db, 0x20dc, 0x20e1, 0x20e7, 0x20e9, 0x20f0,
    // 223–225
    0x2cef, 0x2cf0, 0x2cf1,
    // 226–255
    0x2de0, 0x2de1, 0x2de2, 0x2de3, 0x2de4, 0x2de5, 0x2de6, 0x2de7, 0x2de8, 0x2de9, 0x2dea, 0x2deb,
    0x2dec, 0x2ded, 0x2dee, 0x2def, 0x2df0, 0x2df1, 0x2df2, 0x2df3, 0x2df4, 0x2df5, 0x2df6, 0x2df7,
    0x2df8, 0x2df9, 0x2dfa, 0x2dfb, 0x2dfc, 0x2dfd,
];

/**
 * Encode a PNG buffer as a Kitty Graphics upload sequence (Unicode Placeholder mode).
 *
 * Unlike `encodeKitty` (a=T, immediate display), this stores the image under a
 * numeric ID without rendering it. The caller must then write placeholder characters
 * to select which cells display the image (see `encodeKittyPlaceholders`).
 *
 * Upload params:
 *   a=T  — transmit
 *   U=1  — Unicode Placeholder virtual placement
 *   i=   — image ID (1–4294967295)
 *   f=100 — PNG format
 *   q=2  — quiet (suppress OK/error response)
 *   c=, r= — nominal cell dimensions (informational for the terminal)
 */
export function encodeKittyUpload(
    pngBuffer: Buffer,
    cols: number,
    rows: number,
    imageId: number,
): string {
    const b64 = pngBuffer.toString('base64');
    const parts: string[] = [];

    for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
        const data = b64.slice(i, i + CHUNK_SIZE);
        const isFirst = i === 0;
        const isLast = i + CHUNK_SIZE >= b64.length;

        let params: string;
        if (isFirst) {
            const more = isLast ? 0 : 1;
            params = `a=T,U=1,i=${imageId},f=100,q=2,m=${more},c=${cols},r=${rows}`;
        } else {
            params = `m=${isLast ? 0 : 1},q=2`;
        }

        parts.push(`\x1b_G${params};${data}\x1b\\`);
    }

    return parts.join('');
}

/**
 * Build placeholder character rows for a previously-uploaded Kitty image.
 *
 * Each cell is represented by:
 *   - fg color encoding the image ID: ESC[38;2;R;G;Bm
 *   - U+10EEEE  (Kitty placeholder, string-width=1)
 *   - DIACRITICS[row]  (zero-width combining mark)
 *   - DIACRITICS[col]  (zero-width combining mark)
 *   - U+0020 (trailing space) — only when trailingSpace=true (default)
 *
 * trailingSpace=true  → each cell = 2 terminal columns (Heatmap, 1 char + 1 space layout)
 * trailingSpace=false → each cell = 1 terminal column  (Sparkline, 1 char per column layout)
 *
 * Returns a string with `rows` lines separated by '\n' (no trailing newline).
 */
export function encodeKittyPlaceholders(
    cols: number,
    rows: number,
    imageId: number,
    options: { trailingSpace?: boolean } = {},
): string {
    const { trailingSpace = true } = options;
    const r = (imageId >> 16) & 0xff;
    const g = (imageId >> 8) & 0xff;
    const b = imageId & 0xff;
    const colorSeq = `\x1b[38;2;${r};${g};${b}m`;
    const resetSeq = '\x1b[39m';

    // U+10EEEE encoded as UTF-16 surrogate pair → UTF-8
    const placeholder = '\u{10EEEE}';

    const maxDim = DIACRITICS.length; // 256
    if (rows > maxDim || cols > maxDim) {
        throw new RangeError(
            `encodeKittyPlaceholders: rows (${rows}) and cols (${cols}) must each be ≤ ${maxDim}`,
        );
    }

    const lines: string[] = [];
    for (let row = 0; row < rows; row++) {
        const rowMark = String.fromCodePoint(DIACRITICS[row] ?? 0);
        let line = colorSeq;
        for (let col = 0; col < cols; col++) {
            const colMark = String.fromCodePoint(DIACRITICS[col] ?? 0);
            // placeholder char + row diacritic + col diacritic + trailing space
            line += placeholder + rowMark + colMark + (trailingSpace ? ' ' : '');
        }
        line += resetSeq;
        lines.push(line);
    }

    return lines.join('\n');
}

/**
 * Delete a previously-uploaded Kitty image by ID.
 * Write this to stdout when the component unmounts to free terminal memory.
 */
export function encodeKittyDelete(imageId: number): string {
    return `\x1b_Ga=d,d=I,i=${imageId}\x1b\\`;
}

/**
 * Encode a PNG buffer as a Kitty sequence that transmits and displays immediately
 * (legacy / PoC mode, no image ID). Use `encodeKittyUpload` + `encodeKittyPlaceholders`
 * for ink integration instead.
 */
export function encodeKitty(pngBuffer: Buffer, cols: number, rows: number): string {
    const b64 = pngBuffer.toString('base64');
    const parts: string[] = [];

    for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
        const data = b64.slice(i, i + CHUNK_SIZE);
        const isFirst = i === 0;
        const isLast = i + CHUNK_SIZE >= b64.length;

        let params: string;
        if (isFirst) {
            const more = isLast ? 0 : 1;
            params = `a=T,f=100,q=2,m=${more},c=${cols},r=${rows}`;
        } else {
            params = `m=${isLast ? 0 : 1},q=2`;
        }

        parts.push(`\x1b_G${params};${data}\x1b\\`);
    }

    return parts.join('');
}
