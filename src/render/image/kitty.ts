/**
 * Kitty Graphics Protocol encoder
 *
 * Encodes a PNG buffer into APC escape sequences for terminals that support
 * the Kitty Graphics Protocol (Kitty, WezTerm, Ghostty, VS Code ≥1.110).
 *
 * Spec: https://sw.kovidgoyal.net/kitty/graphics-protocol/
 */

const CHUNK_SIZE = 4096; // base64 characters per APC chunk

/**
 * Encode a PNG buffer as a sequence of Kitty Graphics Protocol escape strings.
 *
 * @param pngBuffer - Raw PNG data
 * @param cols - Width in terminal character columns
 * @param rows - Height in terminal character rows
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
            // a=T: transmit + display immediately
            // f=100: PNG format
            // q=2: quiet (suppress OK response)
            // m=1/0: more chunks / last chunk
            const more = isLast ? 0 : 1;
            params = `a=T,f=100,q=2,m=${more},c=${cols},r=${rows}`;
        } else {
            params = `m=${isLast ? 0 : 1},q=2`;
        }

        // APC: ESC _ G <params> ; <data> ESC backslash
        parts.push(`\x1b_G${params};${data}\x1b\\`);
    }

    return parts.join('');
}
