import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { BigNumber } from '../../src/components/BigNumber';

function stripAnsi(input: string): string {
    return input.replace(
        // biome-ignore lint/suspicious/noControlCharactersInRegex: Standard ANSI strip regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '',
    );
}

describe('BigNumber', () => {
    it('should render large numbers', () => {
        // "1" in our font is:
        // ' █ '
        // ' █ '
        // ' █ '
        const { lastFrame } = render(<BigNumber value={1} />);
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toContain('█');
    });

    it('should render labels', () => {
        const { lastFrame } = render(<BigNumber value={42} label="Test Label" />);
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toContain('Test Label');
    });

    it('should render trends', () => {
        const { lastFrame } = render(<BigNumber value={10} trendDirection="up" trendLabel="10%" />);
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toContain('▲ 10%');
    });

    it('should handle decimal points', () => {
        const { lastFrame } = render(<BigNumber value="1.5" />);
        const output = stripAnsi(lastFrame() ?? '');
        // We look for dot pattern
        expect(output).toContain('▄');
    });

    it('should support braille font style', () => {
        const { lastFrame } = render(<BigNumber value={1} fontStyle="braille" />);
        const output = stripAnsi(lastFrame() ?? '');
        // Braille font uses Braille dots
        expect(output).toContain('⡆');
    });

    it('should support ascii font style', () => {
        const { lastFrame } = render(<BigNumber value={1} fontStyle="ascii" />);
        const output = stripAnsi(lastFrame() ?? '');
        // ASCII font uses pipe character for "1"
        expect(output).toContain('|');
        expect(output).not.toContain('█');
    });
});
