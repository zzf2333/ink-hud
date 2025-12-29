/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { Legend } from '../../../src/components/common/Legend';

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

describe('Legend', () => {
    it('should return empty content for empty items array', () => {
        const { lastFrame } = render(<Legend items={[]} />);
        expect(lastFrame()).toBe('');
    });

    it('should render legend names and symbols', () => {
        const { lastFrame } = render(
            <Legend
                items={[
                    { name: 'CPU', color: 'cyan' },
                    { name: 'Memory', color: 'green' },
                ]}
            />
        );
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toContain('CPU');
        expect(output).toContain('Memory');
        expect(output).toContain('●');
    });

    it('should support custom symbols', () => {
        const { lastFrame } = render(
            <Legend
                items={[
                    { name: 'Data', color: 'blue', symbol: '■' },
                ]}
            />
        );
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toContain('■');
        expect(output).toContain('Data');
    });

    it('should display in one row in horizontal layout', () => {
        const { lastFrame } = render(
            <Legend
                items={[
                    { name: 'A', color: 'red' },
                    { name: 'B', color: 'blue' },
                ]}
                position="horizontal"
            />
        );
        const output = stripAnsi(lastFrame() ?? '');
        const lines = output.split('\n').filter(l => l.trim());
        expect(lines).toHaveLength(1);
    });

    it('should display in multiple lines in vertical layout', () => {
        const { lastFrame } = render(
            <Legend
                items={[
                    { name: 'A', color: 'red' },
                    { name: 'B', color: 'blue' },
                ]}
                position="vertical"
            />
        );
        const output = stripAnsi(lastFrame() ?? '');
        const lines = output.split('\n').filter(l => l.trim());
        expect(lines.length).toBeGreaterThanOrEqual(2);
    });

    it('should use default symbol ●', () => {
        const { lastFrame } = render(
            <Legend items={[{ name: 'Test', color: 'white' }]} />
        );
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toContain('●');
    });
});
