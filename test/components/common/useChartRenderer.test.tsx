import { Text } from 'ink';
import { render } from 'ink-testing-library';
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { InkHudProvider, type ChartKind } from '../../../src/components/InkHudProvider';
import { useChartRenderer } from '../../../src/components/common/useChartRenderer';
import { TerminalDetector } from '../../../src/detect/terminal';

const brailleDetector = new TerminalDetector({
    LANG: 'en_US.UTF-8',
    TERM_PROGRAM: 'iTerm.app',
    COLORTERM: 'truecolor',
});

// Helper: renders the renderer name for a given kind
const KindDisplay = ({ kind }: { kind: ChartKind }) => {
    const renderer = useChartRenderer(kind);
    return <Text>{renderer.getName()}</Text>;
};

// Helper: allows toggling the kind via external state
const SwitchableKindDisplay = () => {
    const [kind, setKind] = useState<ChartKind>('line');
    const renderer = useChartRenderer(kind);
    return (
        <Text
            onPress={() => setKind('bar')}
        >
            {kind}:{renderer.getName()}
        </Text>
    );
};

describe('useChartRenderer', () => {
    it("returns BrailleRenderer for kind='line' under a braille-capable terminal", () => {
        const { lastFrame } = render(
            <InkHudProvider detector={brailleDetector}>
                <KindDisplay kind="line" />
            </InkHudProvider>,
        );
        expect(lastFrame()).toContain('braille');
    });

    it("returns BlockRenderer for kind='bar' (bar default is block)", () => {
        const { lastFrame } = render(
            <InkHudProvider detector={brailleDetector}>
                <KindDisplay kind="bar" />
            </InkHudProvider>,
        );
        expect(lastFrame()).toContain('block');
    });

    it('returns overridden renderer when InkHudProvider renderers prop is set', () => {
        const { lastFrame } = render(
            <InkHudProvider detector={brailleDetector} renderers={{ bar: 'braille' }}>
                <KindDisplay kind="bar" />
            </InkHudProvider>,
        );
        // bar default is 'block', override to 'braille'
        expect(lastFrame()).toContain('braille');
    });
});
