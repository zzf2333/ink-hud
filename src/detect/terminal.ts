/**
 * Terminal capabilities detector
 *
 * Automatically detect terminal-supported features by analyzing environment variables
 */

import type { EnvironmentInfo, TerminalCapabilities } from './types';

/**
 * Terminal capabilities detector
 *
 * Analyze process environment variables to determine current terminal's supported character sets, colors, and other features
 */
export class TerminalDetector {
    /** Terminal whitelist supporting Braille characters (lowercase) */
    private static readonly BRAILLE_SUPPORTED_TERMINALS = [
        'iterm',
        'warp',
        'alacritty',
        'kitty',
        'wezterm',
        'hyper',
        'tabby',
        'rio',
    ];

    /** Environment variable information */
    private envInfo: EnvironmentInfo;

    constructor(env: NodeJS.ProcessEnv = process.env) {
        this.envInfo = this.extractEnvInfo(env);
    }

    /**
     * Extract relevant information from environment variables
     * @param env - Environment variable object
     * @returns Environment information
     */
    private extractEnvInfo(env: NodeJS.ProcessEnv): EnvironmentInfo {
        const info: EnvironmentInfo = {};

        if (env.LANG !== undefined) {
            info.LANG = env.LANG;
        }
        if (env.TERM !== undefined) {
            info.TERM = env.TERM;
        }
        if (env.COLORTERM !== undefined) {
            info.COLORTERM = env.COLORTERM;
        }
        if (env.TERM_PROGRAM !== undefined) {
            info.TERM_PROGRAM = env.TERM_PROGRAM;
        }
        if (env.TERM_PROGRAM_VERSION !== undefined) {
            info.TERM_PROGRAM_VERSION = env.TERM_PROGRAM_VERSION;
        }

        return info;
    }

    /**
     * Detect UTF-8 support
     * @returns Whether UTF-8 is supported
     */
    private checkUtf8Support(): boolean {
        const lang = this.envInfo.LANG || '';
        return lang.toUpperCase().includes('UTF-8') || lang.toUpperCase().includes('UTF8');
    }

    /**
     * Detect Unicode support
     * UTF-8 terminals usually support Unicode
     * @returns Whether Unicode is supported
     */
    private checkUnicodeSupport(): boolean {
        return this.checkUtf8Support();
    }

    /**
     * Detect Braille character support
     * Determine based on terminal program whitelist
     * @returns Whether Braille characters are supported
     */
    private checkBrailleSupport(): boolean {
        const termProgram = (this.envInfo.TERM_PROGRAM || '').toLowerCase();

        // Check whitelist
        return TerminalDetector.BRAILLE_SUPPORTED_TERMINALS.some((supportedTerm) =>
            termProgram.includes(supportedTerm),
        );
    }

    /**
     * Detect Block Elements character support
     * Most terminals supporting Unicode also support Block Elements
     * @returns Whether Block Elements are supported
     */
    private checkBlockElementsSupport(): boolean {
        return this.checkUnicodeSupport();
    }

    /**
     * Detect color support (16 colors or more)
     * @returns Whether colors are supported
     */
    private checkColorSupport(): boolean {
        const term = this.envInfo.TERM || '';
        const colorterm = this.envInfo.COLORTERM || '';

        // Check if TERM contains color identifier
        if (term.includes('color') || term.includes('256color')) {
            return true;
        }

        // Check COLORTERM
        if (colorterm.length > 0) {
            return true;
        }

        return false;
    }

    /**
     * Detect true color support (24-bit RGB)
     * @returns Whether true color is supported
     */
    private checkTrueColorSupport(): boolean {
        const colorterm = this.envInfo.COLORTERM || '';
        return colorterm.toLowerCase() === 'truecolor' || colorterm === '24bit';
    }

    /**
     * Calculate comprehensive terminal capability score (0-100)
     * @returns Score
     */
    private calculateScore(): number {
        let score = 0;

        // UTF-8 support +20
        if (this.checkUtf8Support()) {
            score += 20;
        }

        // Unicode support +10 (UTF-8 included)
        if (this.checkUnicodeSupport()) {
            score += 10;
        }

        // Braille support +30 (advanced feature)
        if (this.checkBrailleSupport()) {
            score += 30;
        }

        // Block Elements support +10
        if (this.checkBlockElementsSupport()) {
            score += 10;
        }

        // Color support +15
        if (this.checkColorSupport()) {
            score += 15;
        }

        // True color support +15
        if (this.checkTrueColorSupport()) {
            score += 15;
        }

        return Math.min(score, 100);
    }

    /**
     * Detect terminal capabilities
     * @returns Terminal capability information
     */
    detect(): TerminalCapabilities {
        const supportsUtf8 = this.checkUtf8Support();
        const supportsUnicode = this.checkUnicodeSupport();
        const supportsBraille = this.checkBrailleSupport();
        const supportsBlockElements = this.checkBlockElementsSupport();
        const supportsColor = this.checkColorSupport();
        const supportsTrueColor = this.checkTrueColorSupport();
        const score = this.calculateScore();

        return {
            supportsUtf8,
            supportsUnicode,
            supportsBraille,
            supportsBlockElements,
            supportsColor,
            supportsTrueColor,
            score,
        };
    }

    /**
     * Get environment information
     * @returns Environment information
     */
    getEnvironmentInfo(): EnvironmentInfo {
        return { ...this.envInfo };
    }
}

/**
 * Global terminal detector instance
 */
export const terminalDetector = new TerminalDetector();
