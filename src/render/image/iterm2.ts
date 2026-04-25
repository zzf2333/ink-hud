/**
 * iTerm2 Inline Images Protocol encoder
 *
 * Encodes a PNG buffer as an OSC 1337 escape sequence for iTerm2.
 *
 * Spec: https://iterm2.com/documentation-images.html
 */

/**
 * Encode a PNG buffer as an iTerm2 inline image escape sequence.
 *
 * @param pngBuffer - Raw PNG data
 * @param cols - Desired display width in character columns (optional)
 */
export function encodeIterm2(pngBuffer: Buffer, cols?: number): string {
    const b64 = pngBuffer.toString('base64');
    const args = ['inline=1', 'preserveAspectRatio=1'];
    if (cols !== undefined) args.push(`width=${cols}`);
    // OSC 1337 ; File=<args>:<base64> BEL
    return `\x1b]1337;File=${args.join(';')}:${b64}\x07`;
}
