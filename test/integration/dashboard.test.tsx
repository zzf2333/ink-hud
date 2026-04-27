/**
 * Dashboard integration test
 *
 * Renders HftDashboard via ink-testing-library with deterministic inputs
 * (fake timers + fixed Math.random) and verifies:
 *  1. No React warnings or errors are emitted
 *  2. Key UI sentinels appear in the output
 *  3. Inline snapshot catches visual regressions
 */

import { render } from 'ink-testing-library';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HftDashboard } from '../../examples/dashboard';
import { stripAnsi } from '../helpers/stripAnsi';

describe('HftDashboard integration', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-01T09:25:13'));
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('renders without React warnings or errors', () => {
        const { unmount } = render(<HftDashboard />);
        vi.advanceTimersByTime(500);

        expect(warnSpy).not.toHaveBeenCalled();

        // Filter out the pre-existing React warning from ink version conflict
        // (ink-testing-library pulls in ink@4.x alongside the project's ink@5.x)
        const appErrors = errorSpy.mock.calls.filter(
            (args) => !String(args[0]).includes('multiple renderers'),
        );
        expect(appErrors).toHaveLength(0);

        unmount();
    });

    it('output contains key UI sentinels', () => {
        const { lastFrame, unmount } = render(<HftDashboard />);
        vi.advanceTimersByTime(500);

        const output = stripAnsi(lastFrame() ?? '');

        expect(output).toContain('QUANT-OS');
        expect(output).toContain('BTC');
        expect(output).toContain('NET PNL');

        unmount();
    });

    it('renders inline snapshot', () => {
        const { lastFrame, unmount } = render(<HftDashboard />);

        // Stay at t=0: no timers fired, data is in its initial state
        const output = stripAnsi(lastFrame() ?? '');

        expect(output).toMatchInlineSnapshot(`
          "
            ╔══════════════════════════════════════════════════════════════════════════════════════════════╗
            ║  QUANT-OS v9.2.1                                                            ● SYSTEM ONLINE  ║
            ║  HFT ALGO MONITORING NODE                                                        9:25:13 AM  ║
            ╚══════════════════════════════════════════════════════════════════════════════════════════════╝

            ╭── NET PNL (24h) ─────╮╭── EXPOSURE ──────────╮╭── VOLUME (24h) ──────╮╭── RISK INDEX ────────╮
            │   ▀▀█ █▀▀ █ █ █▀█    ││      █  ▀▀█ █▀▀      ││         █ █          │Risk █████░░░░░░░░░░ 35%
            │    ▀▄ ▀▀▄ █▄█ █ █    ││      █   ▀▄ ▀▀▄      ││         █▄█          ││                      │
            │   █▄▄ ▄▄█   █ █▄█    ││      █  █▄▄ ▄▄█      ││           █          ││       Mem: 42%       │
            │                      ││                      ││                      ││                      │
            │          USD         ││         k USD        ││         M USD        ││                      │
            ╰──────────────────────╯╰──────────────────────╯╰──────────────────────╯╰──────────────────────╯

            ╭── BTC-USD / ETH-USD Correlation ─────────────────────────────╮╭── Latency ───────────────────╮
            │46.5k ⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉  ● BTC               ││                              │
            │      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││Avg: 15ms                     │
            │      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││                              │
            │46.5k ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ● ETH               ││                              │
            │      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││                              │
            │      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      │╰──────────────────────────────╯
            │46.5k ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      │╭── Market Depth ──────────────╮
            │      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││                              │
            │      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││                              │
            │46.4k ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││                              │
            │      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││                              │
            │      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││                              │
            │46.4k ⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀                      ││                              │
            ╰──────────────────────────────────────────────────────────────╯╰──────────────────────────────╯

            ╭── Live Orders ─────────────────────────────────────────╮┌── Cluster CPU ─────────────────────┐
            │ ID        Symbol    Side     Price     Amt  Status     ││                                    │
            │────────────────────────────────────────────────────────││                                    │
            │                                                        ││                                    │
            │                                                        ││                                    │
            │                                                        │└────────────────────────────────────┘
            │                                                        │┌── System Logs ─────────────────────┐
            │                                                        ││                                    │
            │                                                        ││                                    │
            │                                                        ││                                    │
            │                                                        ││                                    │
            │                                                        ││                                    │
            │                                                        ││                                    │
            ╰────────────────────────────────────────────────────────╯└────────────────────────────────────┘
            Press 'q' to shutdown node.
          "
        `);

        unmount();
    });
});
