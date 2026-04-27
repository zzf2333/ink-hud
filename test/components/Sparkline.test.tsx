import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { InkHudProvider } from '../../src/components/InkHudProvider';
import { Sparkline } from '../../src/components/Sparkline';
import { stripAnsi } from '../helpers/stripAnsi';

const SPARKLINE_DATA = [5, 10, 7, 15, 12, 8, 20, 14];

describe('Sparkline', () => {
    it('renders data points', () => {
        const { lastFrame } = render(<Sparkline data={SPARKLINE_DATA} mode="character" />);
        expect(lastFrame()).not.toBe('');
    });

    it('renders block variant inline snapshot', () => {
        const { lastFrame } = render(
            <Sparkline data={SPARKLINE_DATA} mode="character" variant="block" />,
        );
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`" ▃▂▆▄▂█▅"`);
    });

    it('renders braille variant inline snapshot', () => {
        const { lastFrame } = render(
            <Sparkline data={SPARKLINE_DATA} mode="character" variant="braille" />,
        );
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`"⠀⣄⡀⣦⣤⣀⣿⣦"`);
    });

    it('block and braille variants produce different output', () => {
        const blockFrame = render(
            <Sparkline data={SPARKLINE_DATA} mode="character" variant="block" />,
        ).lastFrame();
        const brailleFrame = render(
            <Sparkline data={SPARKLINE_DATA} mode="character" variant="braille" />,
        ).lastFrame();

        expect(blockFrame).not.toBe(brailleFrame);
    });

    it('InkHudProvider renderers config does not affect Sparkline variant output', () => {
        // Sparkline uses SPARK_LEVELS char table, not the pixel-canvas renderer pipeline.
        // Changing InkHudProvider renderers should have NO effect on Sparkline output.
        const baseFrame = render(
            <Sparkline data={SPARKLINE_DATA} mode="character" variant="block" />,
        ).lastFrame();

        const overrideFrame = render(
            // renderers override is irrelevant for Sparkline
            <InkHudProvider
                renderers={{ line: 'block', area: 'block', bar: 'braille', pie: 'block' }}
            >
                <Sparkline data={SPARKLINE_DATA} mode="character" variant="block" />
            </InkHudProvider>,
        ).lastFrame();

        expect(stripAnsi(baseFrame ?? '')).toBe(stripAnsi(overrideFrame ?? ''));
    });
});
