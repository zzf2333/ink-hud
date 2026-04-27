import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useImageProtocol } from '../../src/hooks/useImageProtocol';

// Minimal PNG: 1×1 transparent pixel
const TINY_PNG = Buffer.from(
    '89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c4944415478016360f8cf000001820181d0a8f600000000049454e44ae426082',
    'hex',
);

// Probe component — renders its result to a Text so we can inspect via lastFrame()
function Probe(props: Parameters<typeof useImageProtocol>[0]) {
    const result = useImageProtocol(props);
    const json = JSON.stringify({
        useImage: result.useImage,
        hasKitty: result.kittyLines !== null,
        hasIterm2: result.iterm2Cols !== null,
        iterm2Cols: result.iterm2Cols,
        kittyLineCount: result.kittyLines?.length ?? 0,
    });
    return <Text>{json}</Text>;
}

function parse(frame: string | undefined) {
    return JSON.parse(frame ?? '{}') as {
        useImage: boolean;
        hasKitty: boolean;
        hasIterm2: boolean;
        iterm2Cols: number | null;
        kittyLineCount: number;
    };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useImageProtocol — character mode', () => {
    it('returns useImage=false when mode=character', () => {
        const { lastFrame } = render(
            <Probe mode="character" charCols={4} charRows={2} pngBuf={TINY_PNG} />,
        );
        const result = parse(lastFrame());
        expect(result.useImage).toBe(false);
        expect(result.hasKitty).toBe(false);
        expect(result.hasIterm2).toBe(false);
    });
});

describe('useImageProtocol — no image protocol detected', () => {
    it('returns useImage=false when no protocol env vars are set', () => {
        // Default test env has no KITTY_WINDOW_ID / TERM_PROGRAM → null protocol
        const { lastFrame } = render(
            <Probe mode="auto" charCols={4} charRows={2} pngBuf={TINY_PNG} />,
        );
        const result = parse(lastFrame());
        expect(result.useImage).toBe(false);
        expect(result.hasKitty).toBe(false);
        expect(result.hasIterm2).toBe(false);
    });
});

describe('useImageProtocol — null pngBuf', () => {
    it('returns useImage=false when pngBuf is null', () => {
        const { lastFrame } = render(<Probe mode="auto" charCols={4} charRows={2} pngBuf={null} />);
        const result = parse(lastFrame());
        expect(result.useImage).toBe(false);
    });
});

describe('useImageProtocol — zero dimensions', () => {
    it('returns useImage=false when charCols=0', () => {
        const { lastFrame } = render(
            <Probe mode="auto" charCols={0} charRows={2} pngBuf={TINY_PNG} />,
        );
        expect(parse(lastFrame()).useImage).toBe(false);
    });

    it('returns useImage=false when charRows=0', () => {
        const { lastFrame } = render(
            <Probe mode="auto" charCols={4} charRows={0} pngBuf={TINY_PNG} />,
        );
        expect(parse(lastFrame()).useImage).toBe(false);
    });
});

describe('useImageProtocol — Kitty protocol (via env var)', () => {
    it('returns kittyLines when KITTY_WINDOW_ID is set', () => {
        const prev = process.env.KITTY_WINDOW_ID;
        process.env.KITTY_WINDOW_ID = '1';
        try {
            const { lastFrame } = render(
                <Probe mode="auto" charCols={4} charRows={2} pngBuf={TINY_PNG} />,
            );
            const result = parse(lastFrame());
            expect(result.useImage).toBe(true);
            expect(result.hasKitty).toBe(true);
            expect(result.hasIterm2).toBe(false);
            expect(result.kittyLineCount).toBe(2);
        } finally {
            // biome-ignore lint/performance/noDelete: must delete to fully unset env var (= undefined sets to string "undefined")
            if (prev === undefined) delete process.env.KITTY_WINDOW_ID;
            else process.env.KITTY_WINDOW_ID = prev;
        }
    });

    it('trailingSpace=true doubles kittyLine count of placeholder chars', () => {
        const prev = process.env.KITTY_WINDOW_ID;
        process.env.KITTY_WINDOW_ID = '1';
        try {
            const { lastFrame } = render(
                <Probe
                    mode="auto"
                    charCols={3}
                    charRows={1}
                    pngBuf={TINY_PNG}
                    trailingSpace={true}
                />,
            );
            const result = parse(lastFrame());
            expect(result.hasKitty).toBe(true);
            expect(result.kittyLineCount).toBe(1);
        } finally {
            // biome-ignore lint/performance/noDelete: must delete to fully unset env var (= undefined sets to string "undefined")
            if (prev === undefined) delete process.env.KITTY_WINDOW_ID;
            else process.env.KITTY_WINDOW_ID = prev;
        }
    });
});

describe('useImageProtocol — iTerm2 iterm2Cols calculation', () => {
    it('trailingSpace=true (default) → iterm2Cols = charCols * 2', () => {
        const prev = process.env.TERM_PROGRAM;
        process.env.TERM_PROGRAM = 'iTerm.app';
        try {
            const { lastFrame } = render(
                <Probe
                    mode="auto"
                    charCols={5}
                    charRows={2}
                    pngBuf={TINY_PNG}
                    trailingSpace={true}
                />,
            );
            const result = parse(lastFrame());
            expect(result.useImage).toBe(true);
            expect(result.hasIterm2).toBe(true);
            expect(result.iterm2Cols).toBe(10); // 5 * 2
        } finally {
            // biome-ignore lint/performance/noDelete: must delete to fully unset env var (= undefined sets to string "undefined")
            if (prev === undefined) delete process.env.TERM_PROGRAM;
            else process.env.TERM_PROGRAM = prev;
        }
    });

    it('trailingSpace=false → iterm2Cols = charCols * 1', () => {
        const prev = process.env.TERM_PROGRAM;
        process.env.TERM_PROGRAM = 'iTerm.app';
        try {
            const { lastFrame } = render(
                <Probe
                    mode="auto"
                    charCols={5}
                    charRows={2}
                    pngBuf={TINY_PNG}
                    trailingSpace={false}
                />,
            );
            const result = parse(lastFrame());
            expect(result.iterm2Cols).toBe(5); // 5 * 1
        } finally {
            // biome-ignore lint/performance/noDelete: must delete to fully unset env var (= undefined sets to string "undefined")
            if (prev === undefined) delete process.env.TERM_PROGRAM;
            else process.env.TERM_PROGRAM = prev;
        }
    });
});
