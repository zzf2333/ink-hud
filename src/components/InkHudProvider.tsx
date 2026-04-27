/**
 * ink-hud Context Provider
 *
 * Provide dependency injection, replacing the global singleton
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { Renderer, RendererType } from '../core/renderer';
import { RendererSelector } from '../detect/selector';
import { TerminalDetector } from '../detect/terminal';
import type { TerminalCapabilities } from '../detect/types';

// ============================================
// Chart renderer configuration
// ============================================

/**
 * Chart types that use the pixel-canvas rendering system
 */
export type ChartKind = 'line' | 'area' | 'bar' | 'pie';

/**
 * Per-chart-kind renderer assignment
 */
export type ChartRenderers = Record<ChartKind, RendererType>;

/**
 * Default renderer per chart kind — pre-tuned for best visual output
 *
 * | Chart | Renderer | Reason |
 * |-------|----------|--------|
 * | line  | braille  | 2×4 sub-pixel grid renders smooth diagonals |
 * | area  | braille  | Fine-grained fill under curves |
 * | bar   | block    | 2×2 cells produce clean rectangular bar edges |
 * | pie   | braille  | Radial pixels benefit from higher resolution |
 */
export const DEFAULT_CHART_RENDERERS: ChartRenderers = {
    line: 'braille',
    area: 'braille',
    bar: 'block',
    pie: 'braille',
};

// ============================================
// Context
// ============================================

/**
 * InkHud Context value
 */
export interface InkHudContextValue {
    /** Renderer selector */
    selector: RendererSelector;

    /** Get terminal capabilities */
    getCapabilities: () => TerminalCapabilities;

    /** Get renderer of specified type */
    getRenderer: (type: RendererType) => Renderer;

    /**
     * Get the renderer configured for a specific chart kind.
     * In development mode, emits a one-time console.warn when falling back to
     * BlockRenderer because the configured renderer is not supported by the
     * current terminal. In production, the fallback is silent.
     */
    getRendererFor: (kind: ChartKind) => Renderer;
}

// Per-selector dedup map — one warning per (kind, target) pair per RendererSelector instance.
// Using WeakMap ensures test isolation: each new RendererSelector gets a fresh Set so
// module-level state does not bleed across test cases.
const selectorFallbackWarnings = new WeakMap<RendererSelector, Set<string>>();

function warnFallback(selector: RendererSelector, kind: ChartKind, target: RendererType): void {
    if (process.env.NODE_ENV === 'production') return;
    let warned = selectorFallbackWarnings.get(selector);
    if (!warned) {
        warned = new Set<string>();
        selectorFallbackWarnings.set(selector, warned);
    }
    const key = `${kind}:${target}`;
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(
        `[ink-hud] Renderer '${target}' is not supported by the current terminal; ` +
            `falling back to 'block' for chart kind '${kind}'. ` +
            `Override via <InkHudProvider renderers={{ ${kind}: 'block' }}>.`,
    );
}

/**
 * Default Context (using global detector)
 */
const defaultSelector = new RendererSelector();
const defaultContext: InkHudContextValue = {
    selector: defaultSelector,
    getCapabilities: () => defaultSelector.getTerminalCapabilities(),
    getRenderer: (type) => defaultSelector.getRenderer(type),
    getRendererFor: (kind) => {
        const target = DEFAULT_CHART_RENDERERS[kind];
        if (defaultSelector.isRendererTypeSupported(target)) {
            return defaultSelector.getRenderer(target);
        }
        warnFallback(defaultSelector, kind, target);
        return defaultSelector.getRenderer('block');
    },
};

const InkHudContext = createContext<InkHudContextValue>(defaultContext);

/**
 * InkHud Provider Props
 */
export interface InkHudProviderProps {
    /**
     * Custom terminal detector
     * For testing or simulating different terminal environments
     */
    detector?: TerminalDetector;

    /**
     * Override the renderer used for specific chart kinds.
     * Unspecified kinds keep their default (see DEFAULT_CHART_RENDERERS).
     *
     * @example
     * ```tsx
     * // Force all line charts to use block renderer
     * <InkHudProvider renderers={{ line: 'block' }}>
     *     <MyApp />
     * </InkHudProvider>
     * ```
     */
    renderers?: Partial<ChartRenderers>;

    children: React.ReactNode;
}

/**
 * InkHud Context Provider
 *
 * Encapsulate renderer selection logic, supports dependency injection.
 * Each chart kind ships with a pre-tuned default renderer — no per-component
 * configuration required.
 *
 * @example
 * ```tsx
 * // Standard usage (automatic detection, best renderer per chart)
 * <InkHudProvider>
 *     <MyApp />
 * </InkHudProvider>
 *
 * // Inject mock for testing
 * <InkHudProvider detector={mockDetector}>
 *     <MyApp />
 * </InkHudProvider>
 *
 * // Override renderer for specific charts
 * <InkHudProvider renderers={{ line: 'block', bar: 'braille' }}>
 *     <MyApp />
 * </InkHudProvider>
 * ```
 */
export const InkHudProvider: React.FC<InkHudProviderProps> = ({
    detector,
    renderers,
    children,
}) => {
    const value = useMemo<InkHudContextValue>(() => {
        const selector = detector ? new RendererSelector(detector) : defaultSelector;

        const mergedRenderers: ChartRenderers = {
            ...DEFAULT_CHART_RENDERERS,
            ...renderers,
        };

        const getRendererFor = (kind: ChartKind): Renderer => {
            const target = mergedRenderers[kind];
            if (selector.isRendererTypeSupported(target)) {
                return selector.getRenderer(target);
            }
            warnFallback(selector, kind, target);
            return selector.getRenderer('block');
        };

        return {
            selector,
            getCapabilities: () => selector.getTerminalCapabilities(),
            getRenderer: (type) => selector.getRenderer(type),
            getRendererFor,
        };
    }, [detector, renderers]);

    return <InkHudContext.Provider value={value}>{children}</InkHudContext.Provider>;
};

/**
 * Get InkHud Context
 *
 * Even without a Provider, returns the default Context (using the global detector)
 */
export function useInkHud(): InkHudContextValue {
    return useContext(InkHudContext);
}

/**
 * Get renderer selector
 *
 * Simplified Hook to directly get the selector
 */
export function useRendererSelector(): RendererSelector {
    return useInkHud().selector;
}
