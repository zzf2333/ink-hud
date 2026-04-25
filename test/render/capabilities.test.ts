import { describe, expect, it } from 'vitest';
import { detectImageProtocol } from '../../src/render/capabilities';

describe('detectImageProtocol', () => {
    it('returns null when no image protocol env vars are set', () => {
        expect(detectImageProtocol({})).toBeNull();
    });

    it('returns kitty when KITTY_WINDOW_ID is set', () => {
        expect(detectImageProtocol({ KITTY_WINDOW_ID: '1' })).toBe('kitty');
    });

    it('returns kitty for WezTerm', () => {
        expect(detectImageProtocol({ TERM_PROGRAM: 'WezTerm' })).toBe('kitty');
    });

    it('returns kitty for Ghostty', () => {
        expect(detectImageProtocol({ TERM_PROGRAM: 'ghostty' })).toBe('kitty');
    });

    it('returns iterm2 for iTerm.app', () => {
        expect(detectImageProtocol({ TERM_PROGRAM: 'iTerm.app' })).toBe('iterm2');
    });

    it('respects INKHU_IMAGE_PROTOCOL=kitty override', () => {
        expect(detectImageProtocol({ INKHU_IMAGE_PROTOCOL: 'kitty' })).toBe('kitty');
    });

    it('respects INKHU_IMAGE_PROTOCOL=iterm2 override', () => {
        expect(detectImageProtocol({ INKHU_IMAGE_PROTOCOL: 'iterm2' })).toBe('iterm2');
    });

    it('respects INKHU_IMAGE_PROTOCOL=none override', () => {
        expect(
            detectImageProtocol({ KITTY_WINDOW_ID: '1', INKHU_IMAGE_PROTOCOL: 'none' }),
        ).toBeNull();
    });

    it('KITTY_WINDOW_ID takes priority over TERM_PROGRAM', () => {
        expect(
            detectImageProtocol({ KITTY_WINDOW_ID: '1', TERM_PROGRAM: 'iTerm.app' }),
        ).toBe('kitty');
    });

    it('returns null for unknown terminals', () => {
        expect(detectImageProtocol({ TERM_PROGRAM: 'Alacritty' })).toBeNull();
    });
});
