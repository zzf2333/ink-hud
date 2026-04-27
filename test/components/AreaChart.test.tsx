import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { AreaChart } from '../../src/components/AreaChart';
import { InkHudProvider } from '../../src/components/InkHudProvider';
import { TerminalDetector } from '../../src/detect/terminal';
import { AREA_FIXTURE_SERIES } from '../fixtures/chartFixtures';
import { stripAnsi } from '../helpers/stripAnsi';

const brailleDetector = new TerminalDetector({
    LANG: 'en_US.UTF-8',
    TERM_PROGRAM: 'iTerm.app',
    COLORTERM: 'truecolor',
});

const CHART_WIDTH = 24;
const CHART_HEIGHT = 8;

describe('AreaChart', () => {
    it('should output empty content when data is empty and axes/legends are disabled', () => {
        const { lastFrame } = render(<AreaChart data={[]} showLegend={false} showAxis={false} />);
        expect(lastFrame()).toBe('');
    });

    it('renders with block renderer — height matches prop', () => {
        const { lastFrame } = render(
            <InkHudProvider renderers={{ area: 'block' }}>
                <AreaChart
                    series={AREA_FIXTURE_SERIES}
                    showLegend={false}
                    showAxis={false}
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
            <InkHudProvider renderers={{ area: 'block' }}>
                <AreaChart
                    series={AREA_FIXTURE_SERIES}
                    showLegend={false}
                    showAxis={false}
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                />
            </InkHudProvider>,
        );
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "                   ▗▇▃
                       ▃▖    ▇██▅▖
                    ▗▄▇█▇▖  ▅█████
                   ▄█████▇▖▗██████
             ▗    ▄████████▇██████
            ▃█▇▃ ▅████████████████
           ▄██████████████████████
          ▄███████████████████████"
        `);
    });

    it('renders braille path inline snapshot', () => {
        const { lastFrame } = render(
            <InkHudProvider detector={brailleDetector}>
                <AreaChart
                    series={AREA_FIXTURE_SERIES}
                    showLegend={false}
                    showAxis={false}
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                />
            </InkHudProvider>,
        );
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣷⣄⠀⠀
          ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⡀⠀⠀⠀⠀⣾⣿⣿⣦⡀
          ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣷⡀⠀⠀⢸⣿⣿⣿⣿⣷
          ⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣷⡀⢀⣿⣿⣿⣿⣿⣿
          ⠀⠀⠀⢀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣷⣼⣿⣿⣿⣿⣿⣿
          ⠀⠀⢠⣿⣷⣄⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
          ⠀⣰⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
          ⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿"
        `);
    });

    it('renders with axis and legend inline snapshot', () => {
        const { lastFrame } = render(
            <InkHudProvider renderers={{ area: 'block' }}>
                <AreaChart
                    series={AREA_FIXTURE_SERIES}
                    showLegend={true}
                    showAxis={true}
                    width={40}
                    height={10}
                />
            </InkHudProvider>,
        );
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "35             ▅▖   ● Load
                     ▗   ██▖
          29        ▄█▖ ▐██▇
                   ▇███ ▇███
          23      ▅████▅████
              ▗▅ ▗██████████
          16  ▅█▆▅██████████
             ▗██████████████
          10 ▆██████████████
             0  2    4 5   7"
        `);
    });
});
