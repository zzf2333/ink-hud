/**
 * Terminal detection type definitions
 *
 * Define type interfaces for terminal capabilities and environment information
 */

/**
 * Terminal capability information
 *
 * Describes features supported by the current terminal and the overall score
 */
export interface TerminalCapabilities {
    /** Whether UTF-8 encoding is supported */
    supportsUtf8: boolean;

    /** Whether Unicode characters are supported */
    supportsUnicode: boolean;

    /** Whether Braille characters are supported (U+2800-U+28FF) */
    supportsBraille: boolean;

    /** Whether Block Elements characters are supported (U+2580-U+259F) */
    supportsBlockElements: boolean;

    /** Whether colors are supported (16 colors or more) */
    supportsColor: boolean;

    /** Whether true color is supported (24-bit RGB) */
    supportsTrueColor: boolean;

    /** Comprehensive terminal capability score (0-100) */
    score: number;
}

/**
 * Environment information
 *
 * Terminal-related information extracted from process environment variables
 */
export interface EnvironmentInfo {
    /** Language environment variable (e.g. en_US.UTF-8) */
    LANG?: string;

    /** Terminal type (e.g. xterm-256color) */
    TERM?: string;

    /** Color support (e.g. truecolor) */
    COLORTERM?: string;

    /** Terminal program name (e.g. iTerm.app, Warp) */
    TERM_PROGRAM?: string;

    /** Terminal program version */
    TERM_PROGRAM_VERSION?: string;
}
