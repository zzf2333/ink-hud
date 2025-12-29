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

    /** Select best renderer */
    selectBest: (chain?: RendererType[]) => Renderer;
}

/**
 * Default Context (using global detector)
 */
const defaultSelector = new RendererSelector();
const defaultContext: InkHudContextValue = {
    selector: defaultSelector,
    getCapabilities: () => defaultSelector.getTerminalCapabilities(),
    getRenderer: (type) => defaultSelector.getRenderer(type),
    selectBest: (chain) => defaultSelector.selectBest(chain),
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
     * Force use of specified renderer
     * Override automatic detection for testing or specific scenarios
     */
    forceRenderer?: RendererType;

    children: React.ReactNode;
}

/**
 * InkHud Context Provider
 *
 * Encapsulate renderer selection logic, supports dependency injection
 *
 * @example
 * ```tsx
 * // Standard usage (automatic detection)
 * <InkHudProvider>
 *     <MyApp />
 * </InkHudProvider>
 *
 * // Inject mock for testing
 * <InkHudProvider detector={mockDetector}>
 *     <MyApp />
 * </InkHudProvider>
 *
 * // Force ASCII renderer
 * <InkHudProvider forceRenderer="ascii">
 *     <MyApp />
 * </InkHudProvider>
 * ```
 */
export const InkHudProvider: React.FC<InkHudProviderProps> = ({
    detector,
    forceRenderer,
    children,
}) => {
    const value = useMemo<InkHudContextValue>(() => {
        const selector = detector ? new RendererSelector(detector) : defaultSelector;

        return {
            selector,
            getCapabilities: () => selector.getTerminalCapabilities(),
            getRenderer: (type) => selector.getRenderer(type),
            selectBest: (chain) => {
                if (forceRenderer) {
                    return selector.getRenderer(forceRenderer);
                }
                return selector.selectBest(chain);
            },
        };
    }, [detector, forceRenderer]);

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
