import type { Pixel, RenderedLine } from './types';

/**
 * Renderer Module - Defines a unified interface for all renderers
 */

/**
 * Renderer type
 */
export type RendererType = 'braille' | 'block' | 'ascii';

/**
 * Renderer resolution information
 * Represents how many pixels each character can display
 */
export interface RendererResolution {
    /** Pixels per character horizontally (e.g. Braille 2, Block 2, ASCII 1) */
    horizontal: number;
    /** Pixels per character vertically (e.g. Braille 4, Block 8, ASCII 1) */
    vertical: number;
}

/**
 * Renderer metadata
 * Describes renderer capabilities and requirements
 */
export interface RendererMetadata {
    /** Renderer name */
    name: RendererType;
    /** Renderer display name */
    displayName: string;
    /** Renderer description */
    description: string;
    /** Renderer resolution */
    resolution: RendererResolution;
    /** Whether UTF-8 support is required */
    requiresUtf8: boolean;
    /** Whether Unicode support is required */
    requiresUnicode: boolean;
    /** Minimum terminal capability score requirement (0-100) */
    minScore: number;
}

/**
 * Abstract Renderer base class
 *
 * Provides common implementations for all drawing primitives. Subclasses only need to implement:
 * - getMetadata(): Return renderer metadata
 * - renderCanvas(): Convert Pixel[][] to terminal characters
 */
export abstract class Renderer {
    /**
     * Get renderer metadata (must be implemented by subclasses)
     */
    abstract getMetadata(): RendererMetadata;

    /**
     * Render Canvas as styled lines of text (must be implemented by subclasses)
     * @param pixels - 2D pixel array
     * @param width - Canvas width (pixels)
     * @param height - Canvas height (pixels)
     * @returns Array of colored text lines
     */
    abstract renderCanvas(pixels: Pixel[][], width: number, height: number): RenderedLine[];

    // ============================================================
    // Common implementations shared by all renderers
    // ============================================================

    /**
     * Create a blank Canvas
     * @param width - Canvas width (pixels)
     * @param height - Canvas height (pixels)
     * @returns 2D pixel array
     */
    createCanvas(width: number, height: number): Pixel[][] {
        return Array.from({ length: height }, () =>
            Array.from({ length: width }, () => ({ active: false })),
        );
    }

    /**
     * Set a single pixel on the Canvas
     * @param canvas - Canvas
     * @param x - x coordinate
     * @param y - y coordinate
     * @param pixel - Pixel properties (active, color, etc.)
     */
    setPixel(
        canvas: Pixel[][],
        x: number,
        y: number,
        pixel: Partial<Pixel> = { active: true },
    ): void {
        const row = canvas[y];
        if (y >= 0 && y < canvas.length && row && x >= 0 && x < row.length) {
            const current = row[x];
            if (current) {
                Object.assign(current, pixel);
            }
        }
    }

    /**
     * Draw line segments (Bresenham's algorithm)
     */
    drawLine(
        canvas: Pixel[][],
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        pixel: Partial<Pixel> = { active: true },
    ): void {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let x = Math.round(x0);
        let y = Math.round(y0);
        const endX = Math.round(x1);
        const endY = Math.round(y1);

        while (true) {
            this.setPixel(canvas, x, y, pixel);
            if (x === endX && y === endY) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }

    /**
     * Draw circle or ring (Midpoint Circle algorithm)
     */
    drawCircle(
        canvas: Pixel[][],
        centerX: number,
        centerY: number,
        radius: number,
        filled = false,
        pixel: Partial<Pixel> = { active: true },
    ): void {
        if (filled) {
            for (let y = -radius; y <= radius; y++) {
                const width = Math.sqrt(radius * radius - y * y);
                for (let x = -width; x <= width; x++) {
                    this.setPixel(canvas, Math.round(centerX + x), Math.round(centerY + y), pixel);
                }
            }
        } else {
            let x = 0;
            let y = radius;
            let d = 1 - radius;

            while (x <= y) {
                this.setPixel(canvas, centerX + x, centerY + y, pixel);
                this.setPixel(canvas, centerX - x, centerY + y, pixel);
                this.setPixel(canvas, centerX + x, centerY - y, pixel);
                this.setPixel(canvas, centerX - x, centerY - y, pixel);
                this.setPixel(canvas, centerX + y, centerY + x, pixel);
                this.setPixel(canvas, centerX - y, centerY + x, pixel);
                this.setPixel(canvas, centerX + y, centerY - x, pixel);
                this.setPixel(canvas, centerX - y, centerY - x, pixel);

                x++;
                if (d < 0) {
                    d += 2 * x + 1;
                } else {
                    y--;
                    d += 2 * (x - y) + 1;
                }
            }
        }
    }

    /**
     * Draw arc (Parametric equation)
     */
    drawArc(
        canvas: Pixel[][],
        centerX: number,
        centerY: number,
        radius: number,
        startAngle: number,
        endAngle: number,
        thickness = 1,
        pixel: Partial<Pixel> = { active: true },
    ): void {
        let start = startAngle;
        let end = endAngle;
        if (start > end) {
            [start, end] = [end, start];
        }

        const angleStep = 1 / (radius * 2);

        for (let r = Math.max(0, radius - thickness + 1); r <= radius; r++) {
            for (let theta = start; theta <= end; theta += angleStep) {
                const x = centerX + r * Math.cos(theta);
                const y = centerY + r * Math.sin(theta);
                this.setPixel(canvas, Math.round(x), Math.round(y), pixel);
            }
        }
    }

    /**
     * Draw rectangle
     */
    drawRect(
        canvas: Pixel[][],
        x: number,
        y: number,
        width: number,
        height: number,
        filled = false,
        pixel: Partial<Pixel> = { active: true },
    ): void {
        if (filled) {
            for (let py = y; py < y + height; py++) {
                for (let px = x; px < x + width; px++) {
                    this.setPixel(canvas, px, py, pixel);
                }
            }
        } else {
            // Bottom side
            for (let px = x; px < x + width; px++) {
                this.setPixel(canvas, px, y + height - 1, pixel);
            }
            // Left side
            for (let py = y; py < y + height; py++) {
                this.setPixel(canvas, x, py, pixel);
            }
            // Right side
            for (let py = y; py < y + height; py++) {
                this.setPixel(canvas, x + width - 1, py, pixel);
            }
        }
    }

    // ============================================================
    // Helper methods
    // ============================================================

    /**
     * Get renderer resolution
     */
    getResolution(): RendererResolution {
        return this.getMetadata().resolution;
    }

    /**
     * Get renderer name
     */
    getName(): RendererType {
        return this.getMetadata().name;
    }

    /**
     * Calculate number of character rows and columns needed to render specified dimensions
     */
    calculateCharDimensions(
        pixelWidth: number,
        pixelHeight: number,
    ): { rows: number; cols: number } {
        const res = this.getResolution();
        return {
            cols: Math.ceil(pixelWidth / res.horizontal),
            rows: Math.ceil(pixelHeight / res.vertical),
        };
    }
}
