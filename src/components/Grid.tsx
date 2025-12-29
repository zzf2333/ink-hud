import { Box, useStdout } from 'ink';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Context to pass grid configuration to items
interface GridContextValue {
    columns: number;
    gap: number;
    totalWidth: number;
    rowHeight?: number | string | undefined;
}

const GridContext = createContext<GridContextValue>({
    columns: 12,
    gap: 0,
    totalWidth: 80, // Fallback
});

// Context to pass available width to immediate children (like Charts)
export interface GridItemContextValue {
    width?: number; // Available width for the content (excluding padding)
    height?: number | string | undefined; // Available height
}

export const GridItemContext = createContext<GridItemContextValue | null>(null);

export interface GridProps {
    /** Number of columns in the grid (default: 12) */
    columns?: number;

    /** Gap between items (horizontal and vertical) */
    gap?: number;

    /**
     * Total width of the grid in characters.
     * If not provided, it will automatically use the terminal width (stdout.columns).
     */
    width?: number;

    /**
     * Width offset to subtract from the terminal width when auto-calculating.
     * Use this to account for parent padding or borders.
     * @deprecated Recommend wrapping content with `<Panel>`, which automatically handles border overhead
     */
    widthOffset?: number;

    /**
     * Default height for all rows/items in the grid.
     * Can be overridden by individual GridItem height prop.
     */
    rowHeight?: number | string | undefined;

    /** Children should be GridItem components */
    children: React.ReactNode;
}

/**
 * Grid Container
 * Acts like a CSS Grid container, arranging items in columns.
 */
export const Grid: React.FC<GridProps> = ({
    columns = 12,
    gap = 0,
    width: propsWidth,
    widthOffset = 0,
    rowHeight,
    children,
}) => {
    const { stdout } = useStdout();
    const [terminalWidth, setTerminalWidth] = useState(stdout ? stdout.columns : 80);

    // Update width on resize
    useEffect(() => {
        if (!stdout) return;
        const onResize = () => setTerminalWidth(stdout.columns);
        stdout.on('resize', onResize);
        return () => {
            stdout.off('resize', onResize);
        };
    }, [stdout]);

    // Use provided width or terminal width
    // Subtract a safety margin (e.g., 2 chars) if using terminal width to prevent edge-case wrapping
    const defaultWidth = terminalWidth > 2 ? terminalWidth - 2 : terminalWidth;
    const totalWidth = propsWidth ?? Math.max(0, defaultWidth - widthOffset);

    return (
        <GridContext.Provider value={{ columns, gap, totalWidth, rowHeight }}>
            <Box
                flexDirection="row"
                flexWrap="wrap"
                columnGap={gap}
                rowGap={gap}
                width={totalWidth}
            >
                {children}
            </Box>
        </GridContext.Provider>
    );
};

export interface GridItemProps {
    /** Number of columns to span (default: 1) */
    span?: number;
    /** Fixed height for this item */
    height?: number | string;
    /** Minimum height for this item */
    minHeight?: number | string;
    /** Overflow behavior */
    overflow?: 'visible' | 'hidden';
    children: React.ReactNode;
}

/**
 * Grid Item
 * A cell in the grid that spans a specific number of columns.
 */
export const GridItem: React.FC<GridItemProps> = ({
    span = 1,
    height,
    minHeight,
    overflow,
    children,
}) => {
    const { columns, gap, totalWidth, rowHeight: contextRowHeight } = useContext(GridContext);

    // Calculate width accounting for gaps
    // Available width for columns = Total - (Columns - 1) * Gap
    const totalGapWidth = Math.max(0, (columns - 1) * gap);
    const availableWidth = Math.max(0, totalWidth - totalGapWidth);

    // Width for this item's span
    // SpanWidth = (SingleColWidth * Span) + ((Span - 1) * Gap)
    // We floor to ensure we don't overflow; flexGrow will fill remainder.
    const colWidth = availableWidth / columns;
    const itemGapWidth = Math.max(0, (span - 1) * gap);
    const basisWidth = Math.floor(colWidth * span + itemGapWidth);

    const effectiveHeight = height ?? contextRowHeight;

    return (
        <GridItemContext.Provider value={{ width: basisWidth, height: effectiveHeight }}>
            <Box
                flexGrow={1}
                flexShrink={1}
                flexBasis={basisWidth}
                flexDirection="column"
                {...(effectiveHeight !== undefined && { height: effectiveHeight })}
                {...(minHeight !== undefined && { minHeight })}
                {...(overflow !== undefined && { overflow })}
            >
                {children}
            </Box>
        </GridItemContext.Provider>
    );
};
