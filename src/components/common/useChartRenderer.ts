/**
 * useChartRenderer - Chart renderer selection Hook
 */

import { useMemo } from 'react';
import type { Renderer } from '../../core/renderer';
import type { ChartKind } from '../InkHudProvider';
import { useInkHud } from '../InkHudProvider';

/**
 * Return the renderer configured for the given chart kind.
 *
 * The actual renderer is determined by InkHudProvider's `renderers` config
 * (merged over DEFAULT_CHART_RENDERERS). If the terminal does not support
 * the configured renderer, BlockRenderer is returned as a silent fallback.
 */
export function useChartRenderer(kind: ChartKind): Renderer {
    const { getRendererFor } = useInkHud();
    return useMemo(() => getRendererFor(kind), [kind, getRendererFor]);
}
