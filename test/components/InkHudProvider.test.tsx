import { Text } from 'ink';
import { render } from 'ink-testing-library';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    DEFAULT_CHART_RENDERERS,
    InkHudProvider,
    type ChartKind,
    useInkHud,
} from '../../src/components/InkHudProvider';
import { TerminalDetector } from '../../src/detect/terminal';

// Helper component: renders the name of the renderer configured for a given kind
const RendererNameDisplay = ({ kind }: { kind: ChartKind }) => {
    const { getRendererFor } = useInkHud();
    const renderer = getRendererFor(kind);
    return <Text>{renderer.getName()}</Text>;
};

// Helper component: renders terminal capability score
const CapabilityDisplay = () => {
    const { getCapabilities } = useInkHud();
    const caps = getCapabilities();
    return <Text>score:{caps.score} braille:{String(caps.supportsBraille)}</Text>;
};

// Braille-capable detector (iTerm2)
const brailleDetector = new TerminalDetector({
    LANG: 'en_US.UTF-8',
    TERM_PROGRAM: 'iTerm.app',
    COLORTERM: 'truecolor',
});

// Block-only detector (Apple Terminal — not in braille whitelist)
const blockOnlyDetector = new TerminalDetector({
    LANG: 'en_US.UTF-8',
    TERM: 'xterm-256color',
    TERM_PROGRAM: 'Apple_Terminal',
});

describe('InkHudProvider', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('default renderer per kind', () => {
        it('should use braille for line charts by default', () => {
            const { lastFrame } = render(
                <InkHudProvider detector={brailleDetector}>
                    <RendererNameDisplay kind="line" />
                </InkHudProvider>,
            );
            expect(lastFrame()).toContain(DEFAULT_CHART_RENDERERS.line); // 'braille'
        });

        it('should use braille for area charts by default', () => {
            const { lastFrame } = render(
                <InkHudProvider detector={brailleDetector}>
                    <RendererNameDisplay kind="area" />
                </InkHudProvider>,
            );
            expect(lastFrame()).toContain(DEFAULT_CHART_RENDERERS.area); // 'braille'
        });

        it('should use block for bar charts by default', () => {
            const { lastFrame } = render(
                <InkHudProvider detector={brailleDetector}>
                    <RendererNameDisplay kind="bar" />
                </InkHudProvider>,
            );
            expect(lastFrame()).toContain(DEFAULT_CHART_RENDERERS.bar); // 'block'
        });

        it('should use braille for pie charts by default', () => {
            const { lastFrame } = render(
                <InkHudProvider detector={brailleDetector}>
                    <RendererNameDisplay kind="pie" />
                </InkHudProvider>,
            );
            expect(lastFrame()).toContain(DEFAULT_CHART_RENDERERS.pie); // 'braille'
        });
    });

    describe('partial renderers override', () => {
        it('should override only specified kinds, keep others at default', () => {
            const { lastFrame: lineFrame } = render(
                <InkHudProvider detector={brailleDetector} renderers={{ line: 'block' }}>
                    <RendererNameDisplay kind="line" />
                </InkHudProvider>,
            );
            expect(lineFrame()).toContain('block');

            const { lastFrame: areaFrame } = render(
                <InkHudProvider detector={brailleDetector} renderers={{ line: 'block' }}>
                    <RendererNameDisplay kind="area" />
                </InkHudProvider>,
            );
            expect(areaFrame()).toContain('braille'); // area keeps default
        });
    });

    describe('full renderers override', () => {
        it('should apply all four kind overrides', () => {
            const allBlock = { line: 'block', area: 'block', bar: 'block', pie: 'block' } as const;
            for (const kind of ['line', 'area', 'bar', 'pie'] as ChartKind[]) {
                const { lastFrame } = render(
                    <InkHudProvider detector={brailleDetector} renderers={allBlock}>
                        <RendererNameDisplay kind={kind} />
                    </InkHudProvider>,
                );
                expect(lastFrame()).toContain('block');
            }
        });
    });

    describe('block fallback when renderer unsupported', () => {
        it('should fall back to block when braille is not supported by the terminal', () => {
            vi.spyOn(console, 'warn').mockImplementation(() => {});

            const { lastFrame } = render(
                // blockOnlyDetector: Apple_Terminal does not support braille
                <InkHudProvider detector={blockOnlyDetector}>
                    <RendererNameDisplay kind="line" />
                </InkHudProvider>,
            );
            // line default is 'braille' but terminal does not support it → falls back to 'block'
            expect(lastFrame()).toContain('block');
        });
    });

    describe('dev-mode fallback warning', () => {
        it('should emit console.warn once when renderer is unsupported', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            render(
                <InkHudProvider detector={blockOnlyDetector}>
                    <RendererNameDisplay kind="line" />
                </InkHudProvider>,
            );

            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0]?.[0]).toMatch(/\[ink-hud\].*braille.*not supported.*line/);
        });

        it('should NOT emit a second warning for the same kind+target on the same selector', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const { rerender } = render(
                <InkHudProvider detector={blockOnlyDetector}>
                    <RendererNameDisplay kind="area" />
                </InkHudProvider>,
            );

            // Trigger a second render with the same provider
            rerender(
                <InkHudProvider detector={blockOnlyDetector}>
                    <RendererNameDisplay kind="area" />
                </InkHudProvider>,
            );

            // Provider useMemo is stable (same detector reference) so same selector instance is reused.
            // The warning should fire at most once per selector per kind:target pair.
            expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
        });
    });

    describe('custom detector injection', () => {
        it('should reflect injected detector capabilities in getCapabilities()', () => {
            const { lastFrame } = render(
                <InkHudProvider detector={brailleDetector}>
                    <CapabilityDisplay />
                </InkHudProvider>,
            );
            const frame = lastFrame() ?? '';
            expect(frame).toContain('braille:true');
        });

        it('should reflect block-only detector in getCapabilities()', () => {
            const { lastFrame } = render(
                <InkHudProvider detector={blockOnlyDetector}>
                    <CapabilityDisplay />
                </InkHudProvider>,
            );
            const frame = lastFrame() ?? '';
            expect(frame).toContain('braille:false');
        });
    });

    describe('default context without Provider', () => {
        it('should return a valid renderer from defaultContext when no Provider wraps the component', () => {
            // useInkHud falls back to defaultContext, which uses the real process.env detector
            const { lastFrame } = render(<RendererNameDisplay kind="bar" />);
            const frame = lastFrame() ?? '';
            // bar defaults to 'block'; in test env braille support depends on CI env
            // We only assert it returns a non-empty, known renderer name
            expect(frame).toMatch(/braille|block/);
        });
    });
});
