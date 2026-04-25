import { useEffect, useMemo, useRef } from 'react';
import { useStdout } from 'ink';
import { detectImageProtocol } from '../render/capabilities';
import { encodeKittyUpload, encodeKittyPlaceholders, encodeKittyDelete } from '../render/image/kitty';
import { encodeIterm2 } from '../render/image/iterm2';

// Single shared counter — all image-mode components draw from this namespace
// so Kitty image IDs are unique across the entire application.
let nextImageId = 1;

export interface UseImageProtocolOptions {
    /**
     * 'character' disables image mode entirely; 'image' forces it (no-op when unsupported);
     * 'auto' detects at runtime and falls back to character mode.
     */
    mode: 'auto' | 'image' | 'character';

    /**
     * Number of Kitty placeholder cells (= columns in the Kitty image grid).
     * With trailingSpace=true  each cell is 2 terminal cols wide (U+10EEEE + space).
     * With trailingSpace=false each cell is 1 terminal col wide.
     */
    charCols: number;

    /** Number of placeholder rows (= rows in the Kitty image grid). */
    charRows: number;

    /** Pre-built PNG buffer. null suppresses image rendering for this render cycle. */
    pngBuf: Buffer | null;

    /**
     * Append a trailing space after each Kitty placeholder cell.
     * true  → 2 terminal cols/cell — use for components whose character mode
     *         renders "char + space" per data cell (e.g. Heatmap's "■ ").
     * false → 1 terminal col/cell — use for components with 1-char-per-column
     *         layout (e.g. Sparkline).
     * @default true
     */
    trailingSpace?: boolean;
}

export interface UseImageProtocolResult {
    /** True when image protocol is active and a PNG has been uploaded. */
    useImage: boolean;

    /**
     * One string per charRow to render as <Text> elements (Kitty protocol).
     * null when Kitty is not the active protocol.
     */
    kittyLines: string[] | null;

    /**
     * Width in terminal columns for blank placeholder rows (iTerm2 protocol).
     * null when iTerm2 is not the active protocol.
     * Render charRows blank lines of this width to reserve the image's space.
     */
    iterm2Cols: number | null;
}

/**
 * Shared hook for image-mode rendering (Heatmap, Sparkline, …).
 *
 * Handles: protocol detection, stable image ID management, Kitty upload/cleanup
 * effects, iTerm2 cursor-up write, and placeholder data for the calling component.
 */
export function useImageProtocol({
    mode,
    charCols,
    charRows,
    pngBuf,
    trailingSpace = true,
}: UseImageProtocolOptions): UseImageProtocolResult {
    const { stdout } = useStdout();

    // Stable image ID for this component instance.
    // Initialized once; survives re-renders; freed on unmount via Kitty delete.
    const imageIdRef = useRef<number>(0);
    if (imageIdRef.current === 0) {
        imageIdRef.current = nextImageId++;
    }
    const imageId = imageIdRef.current;

    const protocol = useMemo(() => {
        if (mode === 'character') return null;
        return detectImageProtocol();
    }, [mode]);

    const useImage =
        protocol !== null &&
        mode !== 'character' &&
        pngBuf !== null &&
        charCols > 0 &&
        charRows > 0;

    // Kitty: upload new PNG when pngBuf changes; delete stored image on unmount.
    useEffect(() => {
        if (!useImage || protocol !== 'kitty' || !pngBuf) return;
        stdout.write(encodeKittyUpload(pngBuf, charCols, charRows, imageId));
        return () => {
            stdout.write(encodeKittyDelete(imageId));
        };
    }, [useImage, protocol, pngBuf, charCols, charRows, imageId, stdout]);

    // iTerm2: overwrite the placeholder region on each pngBuf change.
    useEffect(() => {
        if (!useImage || protocol !== 'iterm2' || !pngBuf) return;
        const terminalCols = charCols * (trailingSpace ? 2 : 1);
        const seq = encodeIterm2(pngBuf, terminalCols);
        stdout.write(`\x1b[${charRows}A\x1b[0G${seq}\x1b[${charRows}B`);
    }, [useImage, protocol, pngBuf, charCols, charRows, trailingSpace, stdout]);

    if (!useImage) {
        return { useImage: false, kittyLines: null, iterm2Cols: null };
    }

    if (protocol === 'kitty') {
        const text = encodeKittyPlaceholders(charCols, charRows, imageId, { trailingSpace });
        return { useImage: true, kittyLines: text.split('\n'), iterm2Cols: null };
    }

    // iTerm2
    return {
        useImage: true,
        kittyLines: null,
        iterm2Cols: charCols * (trailingSpace ? 2 : 1),
    };
}
