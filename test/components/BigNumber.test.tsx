import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import { BigNumber } from '../../src/components/BigNumber';
import { stripAnsi } from '../helpers/stripAnsi';

describe('BigNumber', () => {
    it('should render large numbers', () => {
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
        expect(output).toContain('▄');
    });

    it('should support braille font style', () => {
        const { lastFrame } = render(<BigNumber value={1} fontStyle="braille" />);
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toContain('⡆');
    });

    it('renders block number with thousands separator inline snapshot', () => {
        const { lastFrame } = render(<BigNumber value="14,051" />);
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "                                       █  █ █     █▀█ █▀▀  █
                                                 █  █▄█     █ █ ▀▀▄  █
                                                 █    █  ▙  █▄█ ▄▄█  █
          "
        `);
    });

    it('renders value with suffix inline snapshot', () => {
        const { lastFrame } = render(<BigNumber value="0.18" suffix="%" />);
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "                                         █▀█      █  █▀█
                                                   █ █      █  █▀█
                                                   █▄█  ▄   █  █▄█  %
          "
        `);
    });

    it('renders value with prefix inline snapshot', () => {
        const { lastFrame } = render(<BigNumber value="4,291" prefix="$" />);
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "                                         █ █     ▀▀█ █▀█  █
                                                   █▄█      ▀▄ ▀▀█  █
                                                 $   █  ▙  █▄▄   █  █
          "
        `);
    });

    it('renders braille number with thousands separator inline snapshot', () => {
        const { lastFrame } = render(<BigNumber value="3,037" fontStyle="braille" />);
        expect(stripAnsi(lastFrame() ?? '')).toMatchInlineSnapshot(`
          "                                           ⠤⣤ ⠀⠀ ⣰⣆ ⠤⣤ ⠤⣤
                                                     ⠀⡤ ⠀⠀ ⡇⢸ ⠀⡤ ⠀⡰
                                                     ⠒⠚ ⠀⠢ ⠙⠛ ⠒⠚ ⠀⡇
          "
        `);
    });

    it('warns in dev mode when value contains unsupported characters', async () => {
        vi.resetModules();
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { getBigChar } = await import('../../src/components/BigNumber/font');
        getBigChar('@', 'block');
        expect(warnSpy).toHaveBeenCalledOnce();
        expect(warnSpy.mock.calls[0]?.[0]).toContain('[ink-hud]');
        expect(warnSpy.mock.calls[0]?.[0]).toContain('"@"');
        warnSpy.mockRestore();
    });

    it('deduplicates warn for the same unsupported character', async () => {
        vi.resetModules();
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { getBigChar } = await import('../../src/components/BigNumber/font');
        getBigChar('#', 'block');
        getBigChar('#', 'block');
        expect(warnSpy).toHaveBeenCalledOnce();
        warnSpy.mockRestore();
    });
});
