import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { Gauge } from '../../src/components/Gauge';

function stripAnsi(input: string): string {
    return input.replace(
        // biome-ignore lint/suspicious/noControlCharactersInRegex: Standard ANSI strip regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '',
    );
}

describe('Gauge', () => {
    it('should correctly render progress bar and percentage', () => {
        const { lastFrame } = render(<Gauge value={50} width={10} />);
        const output = stripAnsi(lastFrame() ?? '');
        // 50% of 10 chars = 5 chars
        expect(output).toContain('█████░░░░░');
        expect(output).toContain('50%');
    });

    it('should handle maximum and minimum values', () => {
        const { lastFrame: maxFrame } = render(<Gauge value={120} width={10} />);
        expect(stripAnsi(maxFrame() ?? '')).toContain('100%');

        const { lastFrame: minFrame } = render(<Gauge value={-20} width={10} />);
        expect(stripAnsi(minFrame() ?? '')).toContain('0%');
    });

    it('should support custom characters', () => {
        const { lastFrame } = render(<Gauge value={50} width={10} fillChar="=" emptyChar="-" />);
        expect(stripAnsi(lastFrame() ?? '')).toContain('=====-----');
    });

    it('should display label', () => {
        const { lastFrame } = render(<Gauge label="CPU" value={50} />);
        expect(stripAnsi(lastFrame() ?? '')).toContain('CPU');
    });

    it('should support custom range (min/max)', () => {
        // Range -50 to 50. Value 0 is 50%.
        const { lastFrame } = render(<Gauge value={0} min={-50} max={50} width={10} />);
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toContain('█████░░░░░');
        expect(output).toContain('50%');
    });
});
