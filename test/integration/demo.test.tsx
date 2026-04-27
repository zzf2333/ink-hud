/**
 * Showcase integration test
 *
 * Renders the Showcase component via ink-testing-library with deterministic
 * inputs (fake timers + fixed Math.random + frozen clock) and verifies:
 *  1. No application-level React warnings or errors
 *  2. Key UI sentinels appear on the Overview page
 *  3. Inline snapshot catches visual regressions on the initial frame
 */

import { render } from 'ink-testing-library';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InkHudProvider, ThemeProvider } from '../../src/index';
import { Showcase } from '../../examples/demo';
import { stripAnsi } from '../helpers/stripAnsi';

// Wrap Showcase in required providers (same as production render call)
const WrappedShowcase = () => (
    <InkHudProvider>
        <ThemeProvider>
            <Showcase />
        </ThemeProvider>
    </InkHudProvider>
);

describe('Showcase integration', () => {
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

    it('renders without application-level warnings or errors', () => {
        const { unmount } = render(<WrappedShowcase />);
        vi.advanceTimersByTime(500);

        expect(warnSpy).not.toHaveBeenCalled();

        // Filter the pre-existing "multiple renderers" React warning from
        // ink-testing-library pulling in a different ink version than the project.
        const appErrors = errorSpy.mock.calls.filter(
            (args) => !String(args[0]).includes('multiple renderers'),
        );
        expect(appErrors).toHaveLength(0);

        unmount();
    });

    it('Overview page contains key UI sentinels', () => {
        const { lastFrame, unmount } = render(<WrappedShowcase />);
        vi.advanceTimersByTime(500);

        const output = stripAnsi(lastFrame() ?? '');

        // Tab bar always visible
        expect(output).toContain('[1] Overview');
        expect(output).toContain('[2] Charts');
        expect(output).toContain('[5] Layout');

        // Overview page content sentinels
        expect(output).toContain('Requests/s');
        expect(output).toContain('p99 Latency');
        expect(output).toContain('Throughput');

        unmount();
    });

    it('renders Overview page inline snapshot', () => {
        const { lastFrame, unmount } = render(<WrappedShowcase />);

        // t=0: initial state, no timers fired
        const output = stripAnsi(lastFrame() ?? '');
        expect(output).toMatchInlineSnapshot(`
          "  [1] Overview   [2] Charts   [3] Image   [4] Streams   [5] Layout
          ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
          │ ╭────────────────────────────────────────────────────────────────────────────────────────────────╮│
          │ │  ink-hud showcase                                                                    ● ONLINE  ││
          │ │  system monitor · live metrics                                                     9:25:13 AM  ││
          │ ╰────────────────────────────────────────────────────────────────────────────────────────────────╯│
          │                                                                                                   │
          │ ╭── Requests/s ─────────╮╭── p99 Latency ────────╮╭── Error Rate ────────╮╭── Active Users ──────╮│
          │ │ █  ▀▀█     █ █ █▀▀ █▀█││    █ █ █▀▀            ││ █▀█      █  ▀▀█ █    ││  █      █▀█ █ █ ▀▀█  ││
          │ │ █   ▀▄     █▄█ ▀▀▄ █ █││    █▄█ ▀▀▄  ?   ?     ││ █ █      █   ▀▄  █   ││  █      █▀█ █▄█  ▀▄  ││
          │ │ █  █▄▄  ▙    █ ▄▄█ █▄█││      █ ▄▄█            ││ █▄█  ▄   █  █▄▄   █  ││  █   ▙  █▄█   █ █▄▄  ││
          │ │                       ││                       ││                      ││                      ││
          │ │     req/s ▲ +3.2%     ││      p99 ▲ -8.1%      ││    errors ▼ +0.02    ││     users ▲ +5.4%    ││
          │ ╰───────────────────────╯╰───────────────────────╯╰──────────────────────╯╰──────────────────────╯│
          │ ╭── Throughput — CPU / Memory / Network ──────────────────────────────────────╮╭── CPU ──────────╮│
          │ │71 ⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉  ● CPU              ████████████░░░░░░░░│62%│
          │ │   ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││       62%       ││
          │ │62 ⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒                      ││                 ││
          │ │   ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ● Memory            ││                 ││
          │ │53 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      │╰─────────────────╯│
          │ │   ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      │╭── Memory ───────╮│
          │ │44 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ● Network          ██████████████░░░░░░│71%│
          │ │   ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                      ││       71%       ││
          │ │35 ⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀                      ││                 ││
          │ │   0           7            15           22           29                     ││                 ││
          │ ╰─────────────────────────────────────────────────────────────────────────────╯╰─────────────────╯│
          │ ┌── CPU — block variant ────────┐┌── Memory — braille variant ───┐┌── Network — auto + gradient──┐│
          │ │                               ││⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀           ││                              ││
          │ │                               ││                               ││                              ││
          │ └───────────────────────────────┘└───────────────────────────────┘└──────────────────────────────┘│
          └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
            q quit  ·  ← → or Tab navigate  ·  1-5 jump to page"
        `);

        unmount();
    });
});
