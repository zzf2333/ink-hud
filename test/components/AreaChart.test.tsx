import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { AreaChart } from '../../src/components/AreaChart';
import { InkHudProvider } from '../../src/components/InkHudProvider';

function stripAnsi(input: string): string {
    let output = '';
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (char === '\u001b' && input[i + 1] === '[') {
            i += 2;
            while (i < input.length && input[i] !== 'm') {
                i++;
            }
            i++;
            continue;
        }
        output += char ?? '';
        i++;
    }
    return output;
}

describe('AreaChart', () => {
    it('should output empty content when data is empty and axes/legends are disabled', () => {
        const { lastFrame } = render(<AreaChart data={[]} showLegend={false} showAxis={false} />);
        expect(lastFrame()).toBe('');
    });

    it('should output fixed height canvas content with Block renderer', () => {
        const height = 8;
        const { lastFrame } = render(
            <InkHudProvider renderers={{ area: 'block' }}>
                <AreaChart
                    series={[{ name: 'S1', data: [1, 3, 2, 4, 3, 5] }]}
                    showLegend={false}
                    showAxis={false}
                    width={24}
                    height={height}
                />
            </InkHudProvider>,
        );

        const output = stripAnsi(lastFrame() ?? '');
        expect(output.split('\n')).toHaveLength(height);
        expect(output.trim()).not.toBe('');
    });
});
