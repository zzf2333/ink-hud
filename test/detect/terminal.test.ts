import { describe, expect, it } from 'vitest';
import { TerminalDetector } from '../../src/detect/terminal';

describe('TerminalDetector', () => {
    describe('UTF-8 detection', () => {
        it('should detect UTF-8 support (LANG=en_US.UTF-8)', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsUtf8).toBe(true);
        });

        it('should detect UTF-8 support (LANG=zh_CN.UTF-8)', () => {
            const detector = new TerminalDetector({
                LANG: 'zh_CN.UTF-8',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsUtf8).toBe(true);
        });

        it('should detect no UTF-8 support (LANG=C)', () => {
            const detector = new TerminalDetector({
                LANG: 'C',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsUtf8).toBe(false);
        });

        it('should detect no UTF-8 support (no LANG)', () => {
            const detector = new TerminalDetector({});

            const capabilities = detector.detect();
            expect(capabilities.supportsUtf8).toBe(false);
        });
    });

    describe('Braille detection', () => {
        it('should detect Braille support (iTerm2)', () => {
            const detector = new TerminalDetector({
                TERM_PROGRAM: 'iTerm.app',
                LANG: 'en_US.UTF-8',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsBraille).toBe(true);
        });

        it('should detect Braille support (Warp)', () => {
            const detector = new TerminalDetector({
                TERM_PROGRAM: 'Warp',
                LANG: 'en_US.UTF-8',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsBraille).toBe(true);
        });

        it('should detect Braille support (Alacritty)', () => {
            const detector = new TerminalDetector({
                TERM_PROGRAM: 'alacritty',
                LANG: 'en_US.UTF-8',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsBraille).toBe(true);
        });

        it('should detect no Braille support (Terminal.app)', () => {
            const detector = new TerminalDetector({
                TERM_PROGRAM: 'Apple_Terminal',
                LANG: 'en_US.UTF-8',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsBraille).toBe(false);
        });

        it('should detect no Braille support (no TERM_PROGRAM)', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsBraille).toBe(false);
        });
    });

    describe('color detection', () => {
        it('should detect color support (TERM=xterm-256color)', () => {
            const detector = new TerminalDetector({
                TERM: 'xterm-256color',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsColor).toBe(true);
        });

        it('should detect color support (COLORTERM=truecolor)', () => {
            const detector = new TerminalDetector({
                TERM: 'xterm',
                COLORTERM: 'truecolor',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsColor).toBe(true);
        });

        it('should detect no color support (TERM=dumb)', () => {
            const detector = new TerminalDetector({
                TERM: 'dumb',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsColor).toBe(false);
        });
    });

    describe('true color detection', () => {
        it('should detect true color support (COLORTERM=truecolor)', () => {
            const detector = new TerminalDetector({
                COLORTERM: 'truecolor',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsTrueColor).toBe(true);
        });

        it('should detect true color support (COLORTERM=24bit)', () => {
            const detector = new TerminalDetector({
                COLORTERM: '24bit',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsTrueColor).toBe(true);
        });

        it('should detect no true color support (COLORTERM=256color)', () => {
            const detector = new TerminalDetector({
                COLORTERM: '256color',
            });

            const capabilities = detector.detect();
            expect(capabilities.supportsTrueColor).toBe(false);
        });
    });

    describe('overall score', () => {
        it('should give high score for iTerm2 + UTF-8 + TrueColor', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor',
                TERM_PROGRAM: 'iTerm.app',
            });

            const capabilities = detector.detect();
            expect(capabilities.score).toBeGreaterThanOrEqual(90);
        });

        it('should give low score for basic terminal', () => {
            const detector = new TerminalDetector({
                TERM: 'dumb',
            });

            const capabilities = detector.detect();
            expect(capabilities.score).toBeLessThan(30);
        });

        it('should give medium score for medium terminal', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm-256color',
            });

            const capabilities = detector.detect();
            expect(capabilities.score).toBeGreaterThanOrEqual(40);
            expect(capabilities.score).toBeLessThan(80);
        });

        it('score should not exceed 100', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor',
                TERM_PROGRAM: 'iTerm.app',
            });

            const capabilities = detector.detect();
            expect(capabilities.score).toBeLessThanOrEqual(100);
        });
    });

    describe('full capability test', () => {
        it('should return full capabilities for modern terminal', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor',
                TERM_PROGRAM: 'Warp',
            });

            const capabilities = detector.detect();

            expect(capabilities.supportsUtf8).toBe(true);
            expect(capabilities.supportsUnicode).toBe(true);
            expect(capabilities.supportsBraille).toBe(true);
            expect(capabilities.supportsBlockElements).toBe(true);
            expect(capabilities.supportsColor).toBe(true);
            expect(capabilities.supportsTrueColor).toBe(true);
            expect(capabilities.score).toBeGreaterThanOrEqual(90);
        });

        it('should return limited capabilities for legacy terminal', () => {
            const detector = new TerminalDetector({
                TERM: 'vt100',
            });

            const capabilities = detector.detect();

            expect(capabilities.supportsUtf8).toBe(false);
            expect(capabilities.supportsUnicode).toBe(false);
            expect(capabilities.supportsBraille).toBe(false);
            expect(capabilities.supportsBlockElements).toBe(false);
            expect(capabilities.supportsColor).toBe(false);
            expect(capabilities.supportsTrueColor).toBe(false);
            expect(capabilities.score).toBe(0);
        });
    });

    describe('getEnvironmentInfo', () => {
        it('should return environment information', () => {
            const detector = new TerminalDetector({
                LANG: 'en_US.UTF-8',
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor',
                TERM_PROGRAM: 'iTerm.app',
                TERM_PROGRAM_VERSION: '3.4.0',
            });

            const envInfo = detector.getEnvironmentInfo();

            expect(envInfo.LANG).toBe('en_US.UTF-8');
            expect(envInfo.TERM).toBe('xterm-256color');
            expect(envInfo.COLORTERM).toBe('truecolor');
            expect(envInfo.TERM_PROGRAM).toBe('iTerm.app');
            expect(envInfo.TERM_PROGRAM_VERSION).toBe('3.4.0');
        });
    });
});
