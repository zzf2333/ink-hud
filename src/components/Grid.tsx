import { Box, useStdout } from 'ink';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Context to pass grid configuration to items
interface GridContextValue {
    columns: number;
    gap: number;
    totalWidth: number;
    rowHeight?: number | string | undefined;
    /** Pre-calculated widths for each GridItem (by index) */
    itemWidths?: number[];
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
 * Calculate precise widths for all GridItems
 * Uses "distribute remainder" algorithm to eliminate rounding errors
 */
function calculateItemWidths(
    children: React.ReactNode,
    totalWidth: number,
    columns: number,
    gap: number,
): number[] {
    const childArray = React.Children.toArray(children);
    const itemWidths: number[] = [];

    // Calculate available width for columns (excluding all gaps between columns)
    const totalGapWidth = Math.max(0, (columns - 1) * gap);
    const availableWidth = Math.max(0, totalWidth - totalGapWidth);

    // Base column width and remainder
    const baseColWidth = Math.floor(availableWidth / columns);
    const remainder = availableWidth % columns;

    // Track current column position and remaining extra pixels
    let currentCol = 0;
    let remainingExtra = remainder;

    for (const child of childArray) {
        // Get span from child props (default: 1)
        const span =
            React.isValidElement(child) && typeof child.props.span === 'number'
                ? Math.min(Math.max(1, child.props.span), columns)
                : 1;

        // Calculate how many extra pixels this item should get
        // Distribute extras to columns from left to right
        let itemExtra = 0;
        const startCol = currentCol;
        const endCol = Math.min(currentCol + span, columns);

        for (let col = startCol; col < endCol && remainingExtra > 0; col++) {
            if (col < remainder) {
                itemExtra++;
                remainingExtra--;
            }
        }

        // Recalculate: we should use the actual distribution method
        // For each column in the span, check if it should get +1
        itemExtra = 0;
        for (let col = currentCol; col < currentCol + span && col < columns; col++) {
            if (col < remainder) {
                itemExtra++;
            }
        }

        // Item width = (base * span) + extra pixels + internal gaps
        const itemGapWidth = Math.max(0, (span - 1) * gap);
        const itemWidth = baseColWidth * span + itemExtra + itemGapWidth;

        itemWidths.push(itemWidth);

        // Move to next column position (wrap if needed)
        currentCol += span;
        if (currentCol >= columns) {
            currentCol = 0;
            remainingExtra = remainder; // Reset for next row
        }
    }

    return itemWidths;
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
    // When widthOffset is specified, user is manually managing margins, so don't apply default safety margin
    // Otherwise, subtract a safety margin (2 chars) to prevent edge-case wrapping
    const safetyMargin = widthOffset > 0 ? 0 : 2;
    const defaultWidth =
        terminalWidth > safetyMargin ? terminalWidth - safetyMargin : terminalWidth;
    const totalWidth = propsWidth ?? Math.max(0, defaultWidth - widthOffset);

    // Pre-calculate precise widths for all items
    const itemWidths = calculateItemWidths(children, totalWidth, columns, gap);

    // Clone children with _gridIndex prop
    const childrenWithIndex = React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ _gridIndex?: number }>, {
                _gridIndex: index,
            });
        }
        return child;
    });

    return (
        <GridContext.Provider value={{ columns, gap, totalWidth, rowHeight, itemWidths }}>
            <Box
                flexDirection="row"
                flexWrap="wrap"
                columnGap={gap}
                rowGap={gap}
                width={totalWidth}
            >
                {childrenWithIndex}
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
    /** Internal: index assigned by Grid parent */
    _gridIndex?: number;
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
    _gridIndex,
}) => {
    const {
        columns,
        gap,
        totalWidth,
        rowHeight: contextRowHeight,
        itemWidths,
    } = useContext(GridContext);

    // Get precise width from pre-calculated widths if available
    let basisWidth: number;

    if (itemWidths !== undefined && _gridIndex !== undefined && _gridIndex < itemWidths.length) {
        // Use pre-calculated precise width (non-null assertion safe due to bounds check)
        basisWidth = itemWidths[_gridIndex] ?? 0;
    } else {
        // Fallback to original calculation (for standalone usage)
        const totalGapWidth = Math.max(0, (columns - 1) * gap);
        const availableWidth = Math.max(0, totalWidth - totalGapWidth);
        const colWidth = availableWidth / columns;
        const itemGapWidth = Math.max(0, (span - 1) * gap);
        basisWidth = Math.floor(colWidth * span + itemGapWidth);
    }

    const effectiveHeight = height ?? contextRowHeight;

    return (
        <GridItemContext.Provider value={{ width: basisWidth, height: effectiveHeight }}>
            <Box
                flexGrow={0}
                flexShrink={0}
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
