/**
 * Terminal image protocol capability detection
 */

export type ImageProtocol = 'kitty' | 'iterm2' | null;

/**
 * Detect which image protocol (if any) the current terminal supports.
 *
 * Priority: Kitty Graphics > iTerm2 Inline Images
 * Users can override by setting INKHU_IMAGE_PROTOCOL=kitty|iterm2|none
 */
export function detectImageProtocol(env: NodeJS.ProcessEnv = process.env): ImageProtocol {
    // Manual override
    const override = env.INKHU_IMAGE_PROTOCOL;
    if (override === 'kitty') return 'kitty';
    if (override === 'iterm2') return 'iterm2';
    if (override === 'none') return null;

    // Kitty — dedicated env var
    if (env.KITTY_WINDOW_ID) return 'kitty';

    const tp = (env.TERM_PROGRAM ?? '').toLowerCase();

    // WezTerm and Ghostty speak Kitty Graphics natively
    if (tp === 'wezterm' || tp === 'ghostty') return 'kitty';

    // VS Code integrated terminal supports Kitty since v1.110 (Feb 2026),
    // but requires terminal.integrated.enableImages=true — opt-in only.
    // Users who enable it should set INKHU_IMAGE_PROTOCOL=kitty.

    // iTerm2 (macOS)
    if (tp === 'iterm.app') return 'iterm2';

    return null;
}
