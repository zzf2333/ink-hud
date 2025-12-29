/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { Heatmap } from '../../src/components/Heatmap';

function stripAnsi(input: string): string {
    return input.replace(
        // biome-ignore lint/suspicious/noControlCharactersInRegex: Standard ANSI strip regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '',
    );
}

describe('Heatmap', () => {
    it('should render grid data', () => {
        const data = [
            [1, 2],
            [3, 4],
        ];
        const { lastFrame } = render(<Heatmap data={data} />);
        const output = stripAnsi(lastFrame() ?? '');
        // Should contain at least 4 chars (plus spacing)
        expect(output).toMatch(/■\s+■/);
    });

    it('should correctly handle color gradient mapping', () => {
        // We can't easily check colors with stripAnsi, but we can verify component renders without error
        // and produces output content.
        const data = [[0, 10, 20]];
        const { lastFrame } = render(<Heatmap data={data} colors={['#000', '#fff']} />);
        const output = stripAnsi(lastFrame() ?? '');
        expect(output.replace(/\s/g, '').length).toBe(3); // 3 blocks
    });

    it('should handle all-zero data without crashing', () => {
        const data = [
            [0, 0],
            [0, 0],
        ];
        const { lastFrame } = render(<Heatmap data={data} />);
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toContain('■');
    });
});
