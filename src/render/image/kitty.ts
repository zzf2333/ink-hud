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
const DIACRITICS = [
    0x0305, 0x030D, 0x030E, 0x0310, 0x0312, 0x033D, 0x033E, 0x033F,
    0x0346, 0x034A, 0x034B, 0x034C, 0x0350, 0x0351, 0x0352, 0x0357,
    0x035B, 0x0363, 0x0364, 0x0365, 0x0366, 0x0367, 0x0368, 0x0369,
    0x036A, 0x036B, 0x036C, 0x036D, 0x036E, 0x036F, 0x0483, 0x0484,
    0x0485, 0x0486, 0x0487, 0x0592, 0x0593, 0x0594, 0x0595, 0x0597,
    0x0598, 0x0599, 0x059C, 0x059D, 0x059E, 0x059F, 0x05A0, 0x05A1,
    0x05A8, 0x05A9, 0x05AB, 0x05AC, 0x05AF, 0x05C4, 0x0610, 0x0611,
    0x0612, 0x0613, 0x0614, 0x0615, 0x0616, 0x0617, 0x0657, 0x0658,
    0x0659, 0x065A, 0x065B, 0x065D, 0x065E, 0x06D6, 0x06D7, 0x06D8,
    0x06D9, 0x06DA, 0x06DB, 0x06DC, 0x06DF, 0x06E0, 0x06E1, 0x06E2,
    0x06E4, 0x06E7, 0x06E8, 0x06EB, 0x06EC, 0x0730, 0x0732, 0x0733,
    0x0735, 0x0736, 0x073A, 0x073D, 0x073F, 0x0740, 0x0741, 0x0743,
    0x0745, 0x0747, 0x0749, 0x074A,
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

    const lines: string[] = [];
    for (let row = 0; row < rows; row++) {
        const rowMark = String.fromCodePoint(DIACRITICS[row] ?? DIACRITICS[0]!);
        let line = colorSeq;
        for (let col = 0; col < cols; col++) {
            const colMark = String.fromCodePoint(DIACRITICS[col] ?? DIACRITICS[0]!);
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
