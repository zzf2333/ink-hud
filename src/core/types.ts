export interface Pixel {
    /** Whether the pixel is active (lit) */
    active: boolean;
    /** Color of the pixel */
    color?: string;
}

/**
 * A line of rendered text, consisting of segments with optional styling.
 */
export type RenderedLine = Array<{
    text: string;
    color?: string;
    backgroundColor?: string;
}>;
