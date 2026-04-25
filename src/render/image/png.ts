/**
 * Minimal RGB PNG encoder — no dependencies (uses Node.js built-in zlib).
 */

import { deflateSync } from 'zlib';

// ---------------------------------------------------------------------------
// CRC-32
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[i] = c;
    }
    return table;
})();

function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc = CRC_TABLE[(crc ^ (buf[i] as number)) & 0xff]! ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------------------
// PNG chunk builder
// ---------------------------------------------------------------------------

function chunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBytes = Buffer.from(type, 'ascii');
    const crcBytes = Buffer.alloc(4);
    crcBytes.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
    return Buffer.concat([len, typeBytes, data, crcBytes]);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Encode a grid of RGB pixels into a minimal PNG buffer.
 *
 * @param pixels - Row-major grid: pixels[row][col] = [r, g, b]
 */
export function createRgbPng(pixels: [number, number, number][][]): Buffer {
    const height = pixels.length;
    const width = pixels[0]?.length ?? 0;

    // IHDR
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8; // bit depth
    ihdrData[9] = 2; // colour type: RGB truecolour
    // bytes 10-12: compression=0, filter=0, interlace=0

    // Raw pixel rows: filter byte (None=0) + RGB triplets
    const rawRows: Buffer[] = [];
    for (const row of pixels) {
        const rowBuf = Buffer.alloc(1 + width * 3);
        rowBuf[0] = 0; // filter: None
        let offset = 1;
        for (const [r, g, b] of row) {
            rowBuf[offset++] = r;
            rowBuf[offset++] = g;
            rowBuf[offset++] = b;
        }
        rawRows.push(rowBuf);
    }

    const compressed = deflateSync(Buffer.concat(rawRows), { level: 1 });

    const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    return Buffer.concat([
        PNG_SIGNATURE,
        chunk('IHDR', ihdrData),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

/**
 * Convert a hex colour string (#rrggbb or rrggbb) to [r, g, b].
 */
export function hexToRgb(hex: string): [number, number, number] {
    const h = hex.startsWith('#') ? hex.slice(1) : hex;
    const n = parseInt(h, 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}
