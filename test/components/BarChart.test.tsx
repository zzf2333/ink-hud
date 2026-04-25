import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { BarChart } from '../../src/components/BarChart';
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

describe('BarChart', () => {
    it('should output empty content when data is empty and axes/legends are disabled', () => {
        const { lastFrame } = render(<BarChart data={[]} showLegend={false} showAxis={false} />);
        expect(lastFrame()).toBe('');
    });

    it('should output fixed height canvas content with Block renderer', () => {
        const height = 8;
        const { lastFrame } = render(
            <InkHudProvider renderers={{ bar: 'block' }}>
                <BarChart
                    series={[
                        { name: 'A', data: [1, 2, 3] },
                        { name: 'B', data: [3, 2, 1] },
                    ]}
                    showLegend={false}
                    showAxis={false}
                    width={30}
                    height={height}
                />
            </InkHudProvider>,
        );

        const output = stripAnsi(lastFrame() ?? '');
        expect(output.split('\n')).toHaveLength(height);
        expect(output.trim()).not.toBe('');
    });

    it('should output fixed height canvas content in horizontal mode', () => {
        const height = 10;
        const { lastFrame } = render(
            <InkHudProvider renderers={{ bar: 'block' }}>
                <BarChart
                    series={[
                        { name: 'A', data: [1, 2, 3] },
                        { name: 'B', data: [3, 2, 1] },
                    ]}
                    showLegend={false}
                    showAxis={false}
                    orientation="horizontal"
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
