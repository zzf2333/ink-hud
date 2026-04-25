import { describe, expect, it } from 'vitest';
import { RendererSelector } from '../../src/detect/selector';
import { TerminalDetector } from '../../src/detect/terminal';

describe('RendererSelector', () => {
    describe('getRenderer', () => {
        it('should return Braille renderer', () => {
            const selector = new RendererSelector();
            const renderer = selector.getRenderer('braille');

            expect(renderer.getName()).toBe('braille');
        });

        it('should return Block renderer', () => {
            const selector = new RendererSelector();
            const renderer = selector.getRenderer('block');

            expect(renderer.getName()).toBe('block');
        });

        it('should always create new Renderer instance (no cache)', () => {
            const selector = new RendererSelector();
            const renderer1 = selector.getRenderer('braille');
            const renderer2 = selector.getRenderer('braille');

            // since renderers are stateless, creating a new instance each time is correct behavior
            expect(renderer1.getName()).toBe(renderer2.getName());
        });
    });

    describe('selectBest - high capability terminal', () => {
        it('should select Braille renderer for modern terminal', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor',
                TERM_PROGRAM: 'iTerm.app',
            });

            const selector = new RendererSelector(detector);
            const renderer = selector.selectBest();

            expect(renderer.getName()).toBe('braille');
        });

        it('should select Braille renderer for Warp terminal', () => {
            const detector = new TerminalDetector({
                LANG: 'zh_CN.UTF-8',
                TERM: 'xterm-256color',
                TERM_PROGRAM: 'Warp',
            });

            const selector = new RendererSelector(detector);
            const renderer = selector.selectBest();

            expect(renderer.getName()).toBe('braille');
        });
    });

    describe('selectBest - medium capability terminal', () => {
        it('should select Block renderer for terminals that do not support Braille', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm-256color',
                TERM_PROGRAM: 'Apple_Terminal', // not in Braille whitelist
            });

            const selector = new RendererSelector(detector);
            const renderer = selector.selectBest();

            expect(renderer.getName()).toBe('block');
        });

        it('should select Block renderer for UTF-8 terminal', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm',
            });

            const selector = new RendererSelector(detector);
            const renderer = selector.selectBest();

            expect(renderer.getName()).toBe('block');
        });
    });

    describe('selectBest - low capability terminal (fallback to Block)', () => {
        it('should fallback to Block renderer for legacy terminal without UTF-8', () => {
            const detector = new TerminalDetector({
                TERM: 'vt100',
            });

            const selector = new RendererSelector(detector);
            const renderer = selector.selectBest();

            // Block is now the universal fallback (ASCII removed)
            expect(renderer.getName()).toBe('block');
        });

        it('should fallback to Block renderer when LANG=C', () => {
            const detector = new TerminalDetector({
                LANG: 'C',
                TERM: 'dumb',
            });

            const selector = new RendererSelector(detector);
            const renderer = selector.selectBest();

            expect(renderer.getName()).toBe('block');
        });
    });

    describe('selectBest - custom fallback chain', () => {
        it('should support custom fallback chain (using only Block)', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm-256color',
                TERM_PROGRAM: 'iTerm.app', // supports Braille
            });

            const selector = new RendererSelector(detector);
            // custom chain: skip Braille, use only Block
            const renderer = selector.selectBest(['block']);

            expect(renderer.getName()).toBe('block');
        });

        it('should fallback to Block when fallback chain is empty', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
            });

            const selector = new RendererSelector(detector);
            const renderer = selector.selectBest([]);

            expect(renderer.getName()).toBe('block');
        });
    });

    describe('getTerminalCapabilities', () => {
        it('should return terminal capability information', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor',
                TERM_PROGRAM: 'iTerm.app',
            });

            const selector = new RendererSelector(detector);
            const capabilities = selector.getTerminalCapabilities();

            expect(capabilities.supportsUtf8).toBe(true);
            expect(capabilities.supportsBraille).toBe(true);
            expect(capabilities.supportsColor).toBe(true);
            expect(capabilities.supportsTrueColor).toBe(true);
        });
    });

    describe('automatic fallback logic', () => {
        it('should correctly handle insufficient score for Braille', () => {
            // simulate a low-score terminal (basic functionality only)
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8', // supports UTF-8, but score is not high enough for Braille
            });

            const selector = new RendererSelector(detector);
            const capabilities = detector.detect();

            // verify score is indeed below Braille threshold
            expect(capabilities.score).toBeLessThan(80); // Braille needs 80+
            expect(capabilities.score).toBeGreaterThanOrEqual(30); // Block needs basic UTF-8
            const renderer = selector.selectBest();

            expect(renderer.getName()).toBe('block');
        });

        it('should correctly handle missing capabilities', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm', // no 256color
            });

            const selector = new RendererSelector(detector);
            const renderer = selector.selectBest();

            expect(renderer.getName()).toBe('block');
        });
    });
});
