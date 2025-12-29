/**
 * useChartRenderer - Chart renderer selection Hook
 */

import { useMemo } from 'react';
import type { Renderer, RendererType } from '../../core/renderer';
import { useInkHud } from '../InkHudProvider';

/**
 * Renderer Hook input parameters
 */
export interface ChartRendererProps {
    /** Manually specify Renderer type */
    renderer?: RendererType;
    /** Renderer fallback chain */
    rendererChain?: RendererType[];
}

/**
 * Default renderer fallback chain
 */
export const DEFAULT_RENDERER_CHAIN: RendererType[] = ['braille', 'block', 'ascii'];

/**
 * BarChart default renderer fallback chain (prefer block)
 */
export const BAR_CHART_RENDERER_CHAIN: RendererType[] = ['block', 'braille', 'ascii'];

/**
 * Chart renderer selection Hook
 *
 * Automatically select optimal renderer based on user specification or terminal capabilities
 * Get renderer selector via Context, supports dependency injection
 */
export function useChartRenderer(
    props: ChartRendererProps,
    defaultChain: RendererType[] = DEFAULT_RENDERER_CHAIN,
): Renderer {
    const { getRenderer, selectBest } = useInkHud();

    const {
        renderer: preferredRenderer,
        rendererChain = defaultChain,
    } = props;

    return useMemo(() => {
        if (preferredRenderer) {
            return getRenderer(preferredRenderer);
        }
        return selectBest(rendererChain);
    }, [preferredRenderer, rendererChain, getRenderer, selectBest]);
}
