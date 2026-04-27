import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { InkHudProvider } from '../../src/components/InkHudProvider';
import { PieChart } from '../../src/components/PieChart';
import { TerminalDetector } from '../../src/detect/terminal';
import { PIE_FIXTURE_DATA } from '../fixtures/chartFixtures';
import { stripAnsi } from '../helpers/stripAnsi';

const brailleDetector = new TerminalDetector({
    LANG: 'en_US.UTF-8',
    TERM_PROGRAM: 'iTerm.app',
    COLORTERM: 'truecolor',
});

const CHART_WIDTH = 24;
const CHART_HEIGHT = 12;

describe('PieChart', () => {
    it('should output empty content on empty data', () => {
        const { lastFrame } = render(<PieChart data={[]} showLegend={false} />);
        expect(lastFrame()).toBe('');
    });

    it('should output empty content when total sum is 0', () => {
        const { lastFrame } = render(
            <PieChart data={[{ name: 'A', value: 0 }]} showLegend={false} />,
        );
        expect(lastFrame()).toBe('');
    });

    it('renders with block renderer — height matches prop', () => {
        const { lastFrame } = render(
            <InkHudProvider renderers={{ pie: 'block' }}>
                <PieChart
                    data={PIE_FIXTURE_DATA}
                    showLegend={false}
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                />
            </InkHudProvider>,
        );
        const output = stripAnsi(lastFrame() ?? '');
        expect(output.split('\n')).toHaveLength(CHART_HEIGHT);
        expect(output.trim()).not.toBe('');
    });

    it('renders block path inline snapshot', () => {
        const { lastFrame } = render(
            <InkHudProvider renderers={{ pie: 'block' }}>
                <PieChart
                    data={PIE_FIXTURE_DATA}
                    showLegend={false}
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                />
            </InkHudProvider>,
        );
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "       ▂▃▄▅▅▆▅▅▄▃▖
              ▂▅████████████▇▃▖
            ▗▅████████████████▇▃
           ▗▇███████████████████▄
           ▇█████████████████████▖
           ██████████████████████▌
          ███████████████████████▅
           ▇█████████████████████▅
           ▇████████████████████▄
            ▇▃█████████████████▅
              ▆▃████████████▇▄▇
                █▆▄▃▂▂▂▂▃▄▅▇"
        `);
    });

    it('renders braille path inline snapshot', () => {
        const { lastFrame } = render(
            <InkHudProvider detector={brailleDetector}>
                <PieChart
                    data={PIE_FIXTURE_DATA}
                    showLegend={false}
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                />
            </InkHudProvider>,
        );
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣤⣤⣦⣤⣤⣄⣀⠀⠀⠀⠀⠀⠀⠀
          ⠀⠀⠀⠀⢀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣄⠀⠀⠀⠀
          ⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀
          ⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀
          ⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄
          ⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
          ⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏
          ⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇
          ⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀
          ⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀
          ⠀⠀⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⠈⠙⠛⠿⠿⠿⡿⠿⠿⠟⠛⠉⠀⠀⠀⠀⠀⠀"
        `);
    });

    it('renders with legend inline snapshot', () => {
        const { lastFrame } = render(
            <InkHudProvider renderers={{ pie: 'block' }}>
                <PieChart
                    data={PIE_FIXTURE_DATA}
                    showLegend={true}
                    showLabels={true}
                    width={30}
                    height={12}
                />
            </InkHudProvider>,
        );
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "             ● Alpha (40.0%)


                       ● Beta (35.0%)
              ▗▄▅▆▅▃
              ██████▌
             ███████▅  ● Gamma (25.0%)
              ▇▄▂▂▃▅



          "
        `);
    });

    it('block and braille renderers produce different aspect ratios', () => {
        const blockFrame = render(
            <InkHudProvider renderers={{ pie: 'block' }}>
                <PieChart
                    data={PIE_FIXTURE_DATA}
                    showLegend={false}
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                />
            </InkHudProvider>,
        ).lastFrame();

        const brailleFrame = render(
            <InkHudProvider detector={brailleDetector}>
                <PieChart
                    data={PIE_FIXTURE_DATA}
                    showLegend={false}
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                />
            </InkHudProvider>,
        ).lastFrame();

        // Different renderers have different pixel resolutions → different aspect ratio
        // correction → visually different outputs (not identical character sequences)
        expect(stripAnsi(blockFrame ?? '')).not.toBe(stripAnsi(brailleFrame ?? ''));
    });
});
