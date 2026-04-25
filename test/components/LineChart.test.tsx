import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { InkHudProvider } from '../../src/components/InkHudProvider';
import { LineChart } from '../../src/components/LineChart';

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

describe('LineChart', () => {
    it('should output empty content when data is empty and axes/legends are disabled', () => {
        const { lastFrame } = render(<LineChart data={[]} showLegend={false} showAxis={false} />);
        expect(lastFrame()).toBe('');
    });

    it('should output fixed height canvas content with Block renderer', () => {
        const height = 8;
        const { lastFrame } = render(
            <InkHudProvider renderers={{ line: 'block' }}>
                <LineChart
                    series={[{ name: 'S1', data: [0, 10, 5, 12, 3, 8] }]}
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
