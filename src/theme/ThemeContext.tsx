/**
 * ThemeContext - Theme Context
 *
 * Provides unified color configuration, replacing hardcoded colors
 */

import React, { createContext, useContext, useMemo } from 'react';
import { ONE_DARK_PALETTES } from '../utils/gradient';

/**
 * Semantic color configuration
 */
export interface SemanticColors {
    /** Success/Up */
    success: string;
    /** Error/Down */
    error: string;
    /** Warning */
    warning: string;
    /** Info */
    info: string;
    /** Secondary/Disabled */
    muted: string;
    /** Primary text */
    text: string;
    /** Secondary text */
    textSecondary: string;
}

/**
 * Heatmap gradient configuration
 */
export interface HeatmapGradient {
    /** Gradient color array (from dark to light) */
    colors: string[];
}

/**
 * Theme configuration
 */
export interface Theme {
    /** Theme name */
    name: string;
    /** Series colors (for charts) */
    palette: string[];
    /** Semantic colors */
    semantic: SemanticColors;
    /** Heatmap gradient */
    heatmapGradient: string[];
}

/**
 * One Dark Theme (default)
 */
export const ONE_DARK_THEME: Theme = {
    name: 'one-dark',
    palette: ONE_DARK_PALETTES.standard,
    semantic: {
        success: '#98c379', // green
        error: '#e06c75',   // red
        warning: '#e5c07b', // yellow
        info: '#61afef',    // blue
        muted: '#5c6370',   // gray
        text: '#abb2bf',    // light gray
        textSecondary: '#5c6370', // dark gray
    },
    heatmapGradient: [
        '#282c34', // background (dark)
        '#56b6c2', // cyan
        '#98c379', // green
        '#e5c07b', // yellow
        '#61afef', // blue (light)
    ],
};

/**
 * Theme Context
 */
const ThemeContext = createContext<Theme>(ONE_DARK_THEME);

/**
 * Theme Provider Props
 */
export interface ThemeProviderProps {
    /** Custom theme (optional) */
    theme?: Partial<Theme>;
    children: React.ReactNode;
}

/**
 * Theme Provider
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // Custom theme
 * <ThemeProvider theme={{ semantic: { success: '#00ff00' } }}>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    theme: customTheme,
    children,
}) => {
    const mergedTheme = useMemo<Theme>(() => {
        if (!customTheme) {
            return ONE_DARK_THEME;
        }
        return {
            ...ONE_DARK_THEME,
            ...customTheme,
            semantic: {
                ...ONE_DARK_THEME.semantic,
                ...customTheme.semantic,
            },
        };
    }, [customTheme]);

    return (
        <ThemeContext.Provider value={mergedTheme}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Get current theme
 *
 * @example
 * ```tsx
 * const theme = useTheme();
 * <Text color={theme.semantic.success}>Success</Text>
 * ```
 */
export function useTheme(): Theme {
    return useContext(ThemeContext);
}

/**
 * Get semantic colors
 *
 * @example
 * ```tsx
 * const colors = useSemanticColors();
 * <Text color={colors.error}>Error</Text>
 * ```
 */
export function useSemanticColors(): SemanticColors {
    const theme = useTheme();
    return theme.semantic;
}
