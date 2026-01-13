import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { PulseBar } from '../../src/components/PulseBar';

function stripAnsi(input: string): string {
    return input.replace(
        // biome-ignore lint/suspicious/noControlCharactersInRegex: Standard ANSI strip regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '',
    );
}

describe('PulseBar', () => {
    it('should render unicode borders and bar count', () => {
        const records = [{ status: 'good' }, { status: 'bad' }] as const;
        const { lastFrame } = render(<PulseBar records={records} maxBars={4} />);
        const output = stripAnsi(lastFrame() ?? '').trimEnd();
        const lines = output.split('\n');

        expect(lines[0]).toBe('╭────╮');
        expect(lines[2]).toBe('╰────╯');
        expect(lines[1].startsWith('│')).toBe(true);
        expect(lines[1].endsWith('│')).toBe(true);
        expect((lines[1].match(/▌/g) ?? []).length).toBe(4);
    });

    it('should render ascii variant borders', () => {
        const records = [{ status: 'unstable' }] as const;
        const { lastFrame } = render(<PulseBar records={records} maxBars={3} variant="ascii" />);
        const output = stripAnsi(lastFrame() ?? '').trimEnd();
        const lines = output.split('\n');

        expect(lines[0]).toBe('/---\\');
        expect(lines[2]).toBe('\\---/');
        expect(lines[1].length).toBe(5);
    });
});
