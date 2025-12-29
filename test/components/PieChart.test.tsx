import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { PieChart } from '../../src/components/PieChart';

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

    it('should output fixed height canvas content with ASCII renderer', () => {
        const height = 8;
        const width = 20;
        const { lastFrame } = render(
            <PieChart
                data={[
                    { name: 'A', value: 30 },
                    { name: 'B', value: 70 },
                ]}
                renderer="ascii"
                showLegend={false}
                width={width}
                height={height}
            />,
        );

        const output = stripAnsi(lastFrame() ?? '');
        const lines = output.split('\n');
        expect(lines).toHaveLength(height);
        expect(output.trim()).not.toBe('');
        expect(output).toMatch(/[^\s]/);
    });
});
