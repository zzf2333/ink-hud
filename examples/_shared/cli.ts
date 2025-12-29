import type { RendererType } from 'ink-hud';

export type CharsetMode = 'compare' | 'auto' | RendererType;

export function parseCharsetMode(argv: string[]): CharsetMode {
    const args = argv.slice(2);
    const flagIndex = args.findIndex((a) => a === '--charset');
    const inlineFlag = args.find((a) => a.startsWith('--charset='));

    const raw =
        flagIndex >= 0 ? args[flagIndex + 1] : inlineFlag ? inlineFlag.split('=')[1] : undefined;
    if (!raw) {
        return 'compare';
    }
    if (raw === 'auto') {
        return 'auto';
    }

    const valid: RendererType[] = ['braille', 'block', 'ascii'];
    return valid.includes(raw as RendererType) ? (raw as RendererType) : 'compare';
}
