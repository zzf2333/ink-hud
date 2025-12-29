import type { LegendItem } from 'ink-hud';
import type { RendererType } from 'ink-hud';

export type SymbolSetId = 'braille' | 'unicode-blocks' | 'ascii';

export const SYMBOL_SETS: Array<{
    id: SymbolSetId;
    title: string;
    description: string;
    symbols: string[];
}> = [
        {
            id: 'braille',
            title: 'Braille Dot Matrix',
            description: 'Default recommended (fine-grained, consistent with rendering style)',
            symbols: ['⠁', '⠃', '⠇', '⠿', '⡇', '⣿'],
        },
        {
            id: 'unicode-blocks',
            title: 'Unicode Blocks',
            description: '"Pixel style" block symbols',
            symbols: ['▇', '▆', '▅', '▄', '▃', '▂', '▁'],
        },
        {
            id: 'ascii',
            title: 'ASCII',
            description: 'Maximum compatibility (legacy terminals/SSH)',
            symbols: ['*', '+', 'x', '#', 'o', '@'],
        },
    ];

export function symbolSetForRenderer(renderer: RendererType): SymbolSetId {
    if (renderer === 'braille') return 'braille';
    if (renderer === 'block') return 'unicode-blocks';
    return 'ascii';
}

export function getSymbolSet(id: SymbolSetId): (typeof SYMBOL_SETS)[number] {
    return SYMBOL_SETS.find((s) => s.id === id) ?? SYMBOL_SETS[0]!;
}

export function symbolsForCount(symbols: string[], count: number): string[] {
    return Array.from({ length: count }, (_, i) => symbols[i % symbols.length] ?? '●');
}

export function withSymbols(items: Array<Omit<LegendItem, 'symbol'>>, symbols: string[]): LegendItem[] {
    const mapped = symbolsForCount(symbols, items.length);
    return items.map((item, i) => ({ ...item, symbol: mapped[i] }));
}
