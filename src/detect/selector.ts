/**
 * Renderer Selector
 *
 * Automatically selects the optimal renderer based on terminal capabilities to achieve intelligent fallback
 */

import { AsciiRenderer } from '../core/ascii';
import { BlockRenderer } from '../core/block';
import { BrailleRenderer } from '../core/braille';
import type { Renderer, RendererType } from '../core/renderer';
import { TerminalDetector } from './terminal';
import type { TerminalCapabilities } from './types';

/**
 * Renderer Selector
 *
 * Automatically detects terminal capabilities and selects the optimal renderer
 * Supports custom fallback chains and renderer caching
 */
export class RendererSelector {
    /** Terminal detector */
    private detector: TerminalDetector;

    constructor(detector: TerminalDetector = new TerminalDetector()) {
        this.detector = detector;
    }

    /**
     * Creates a renderer instance of the specified type
     * @param type - Renderer type
     * @returns Renderer instance
     */
    private createRenderer(type: RendererType): Renderer {
        switch (type) {
            case 'braille':
                return new BrailleRenderer();
            case 'block':
                return new BlockRenderer();
            case 'ascii':
                return new AsciiRenderer();
        }
    }

    /**
     * Get renderer by type
     * @param type - Renderer type
     * @returns Renderer instance
     */
    getRenderer(type: RendererType): Renderer {
        return this.createRenderer(type);
    }

    /**
     * Check if the renderer meets terminal capability requirements
     * @param renderer - Renderer instance
     * @param capabilities - Terminal capabilities
     * @returns Whether requirements are met
     */
    private isRendererSupported(renderer: Renderer, capabilities: TerminalCapabilities): boolean {
        const metadata = renderer.getMetadata();

        // Check minimum score requirement
        if (capabilities.score < metadata.minScore) {
            return false;
        }

        // Check UTF-8 requirement
        if (metadata.requiresUtf8 && !capabilities.supportsUtf8) {
            return false;
        }

        // Check Unicode requirement
        if (metadata.requiresUnicode && !capabilities.supportsUnicode) {
            return false;
        }

        // Additional checks for specific renderers
        const rendererName = metadata.name;

        // Braille requires explicit support
        if (rendererName === 'braille' && !capabilities.supportsBraille) {
            return false;
        }

        // Block Elements requires Unicode support
        if (rendererName === 'block' && !capabilities.supportsBlockElements) {
            return false;
        }

        return true;
    }

    /**
     * Automatically select the best renderer
     *
     * Try in the order of the priority chain, returning the first renderer that meets terminal capability requirements
     * If none are satisfied, fallback to ASCII
     *
     * @param preferredChain - Priority chain (default: ['braille', 'block', 'ascii'])
     * @returns Selected renderer instance
     */
    selectBest(preferredChain: RendererType[] = ['braille', 'block', 'ascii']): Renderer {
        // Detect terminal capabilities
        const capabilities = this.detector.detect();

        // Traverse according to the priority chain
        for (const rendererType of preferredChain) {
            const renderer = this.getRenderer(rendererType);

            // Check whether requirements are met
            if (this.isRendererSupported(renderer, capabilities)) {
                return renderer;
            }
        }

        // Fallback to ASCII (no requirements, supported by any terminal)
        return this.getRenderer('ascii');
    }

    /**
     * Get terminal capability information
     * @returns Terminal capabilities
     */
    getTerminalCapabilities(): TerminalCapabilities {
        return this.detector.detect();
    }
}


/**
 * Global RendererSelector instance
 */
export const rendererSelector = new RendererSelector();
