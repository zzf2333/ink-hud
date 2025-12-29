import { Box, Text, useFocus, useInput } from 'ink';
import React, { useMemo, useContext } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { GridItemContext } from './Grid';

export interface TableColumn<T> {
    /**
     * Header title
     */
    header: string;

    /**
     * Data accessor key (if property of T) or render function
     */
    accessor: keyof T | ((item: T) => React.ReactNode);

    /**
     * Optional fixed width (if not provided, auto-calculated)
     */
    width?: number;

    /**
     * Alignment
     * @default 'left'
     */
    align?: 'left' | 'right' | 'center';
}

export interface TableProps<T> {
    /**
     * Data array
     */
    data: T[];

    /**
     * Column definitions
     */
    columns: TableColumn<T>[];

    /**
     * Currently sorted column key (matches matches column header or some ID? Let's use header/index for simplicity or separate ID)
     * For simplicity, let's match 'header' string or an index.
     * Let's use the index of the column for simplicity in this TUI context, or match header string.
     */
    sortColumn?: number | string;

    /**
     * Sort direction
     */
    sortDirection?: 'asc' | 'desc';

    /**
     * Enable zebra striping
     * @default false
     */
    zebra?: boolean;

    /**
     * Callback when a column header is activated (sorted)
     */
    onSort?: (column: TableColumn<T>, index: number) => void;
}

// Alignment mapping constants
const ALIGN_MAP = {
    left: 'flex-start',
    right: 'flex-end',
    center: 'center',
} as const;

interface HeaderCellProps<T> {
    column: TableColumn<T>;
    width: number;
    isSorted: boolean;
    sortDirection: 'asc' | 'desc';
    onSort?: (column: TableColumn<T>) => void;
    align: 'flex-start' | 'center' | 'flex-end';
    autoFocus?: boolean;
}

const SortableHeaderCell = <T,>({
    column,
    width,
    isSorted,
    sortDirection,
    onSort,
    align,
    autoFocus,
}: HeaderCellProps<T>) => {
    const theme = useTheme();
    const semantic = theme.semantic;
    const { isFocused } = useFocus({ autoFocus: !!autoFocus });

    useInput((input, key) => {
        if (isFocused && (key.return || input === ' ')) {
            onSort?.(column);
        }
    });

    let indicator = '';
    if (isSorted) {
        indicator = sortDirection === 'asc' ? ' ▲' : ' ▼';
    }

    return (
        <Box
            width={width}
            justifyContent={align}
            flexShrink={0}
            paddingX={1}
            {...(isFocused ? { borderStyle: 'single' } : {})}
            borderColor={semantic.info}
            marginTop={isFocused ? -1 : 0} // visual adjustment for border
            // Or better: use inverse color for focus
        >
            {/* 
                Border adds size, might shift layout. 
                Using inverse/underline for focus is safer in fixed layout.
             */}
            <Text
                bold
                color={isFocused ? semantic.info : semantic.success}
                underline={isFocused}
                wrap="truncate-end"
            >
                {column.header}
                {indicator}
            </Text>
        </Box>
    );
};

/**
 * Table - Data table with interactive sort headers
 */
// Helper to separate cell content extraction
const getCellContentLength = <T,>(item: T, col: TableColumn<T>): number => {
    let content = '';
    if (typeof col.accessor === 'function') {
        const result = col.accessor(item);
        if (typeof result === 'string' || typeof result === 'number') {
            content = String(result);
        }
    } else {
        const val = item[col.accessor];
        if (val !== undefined && val !== null) {
            content = String(val);
        }
    }
    return content.length;
};

// Helper to calculate widths
const calculateWidths = <T,>(columns: TableColumn<T>[], data: T[]) => {
    return columns.map((col) => {
        if (col.width) return col.width;

        let max = col.header.length + 2;
        for (const item of data) {
            max = Math.max(max, getCellContentLength(item, col));
        }
        return max + 2;
    });
};

/**
 * Table - Data table with interactive sort headers
 */
export const Table = <T,>({
    data,
    columns,
    sortColumn,
    sortDirection = 'asc',
    zebra = false,
    onSort,
}: TableProps<T>) => {
    // 1. Resolve Context for Width
    const gridContext = useContext(GridItemContext);
    const availableWidth = gridContext?.width;

    // 2. Calculate column widths based on content
    const contentWidths = useMemo(() => calculateWidths(columns, data), [data, columns]);
    const totalContentWidth = contentWidths.reduce((a, b) => a + b, 0);

    // 3. Adjust widths to fit availableWidth
    // 3. Adjust widths to fit availableWidth
    const finalColumnWidths = useMemo(() => {
        if (!availableWidth) {
            return contentWidths;
        }

        // Expansion Strategy: If we have extra space, fill it proportionally
        // Compression Strategy: If we don't have enough space, scale down
        // Both can be handled by the same scale factor logic
        const scale = availableWidth / totalContentWidth;

        // If scale is close to 1 (within rounding error), just return contentWidths?
        // No, we want to snap to availableWidth exactly if possible.

        let allocated = 0;
        return contentWidths.map((w, i) => {
            // If this is the last column, give it the remaining space
            // This handles both rounding errors and ensures we fill the width
            if (i === contentWidths.length - 1) {
                return Math.max(1, availableWidth - allocated);
            }

            const newW = Math.floor(w * scale);
            allocated += newW;
            return Math.max(1, newW);
        });
    }, [availableWidth, totalContentWidth, contentWidths]);

    return (
        <Box
            flexDirection="column"
            {...(availableWidth !== undefined && { width: availableWidth })}
        >
            {/* Header */}
            <Box
                borderStyle="single"
                borderTop={false}
                borderLeft={false}
                borderRight={false}
                borderBottom={true}
                flexDirection="row"
            >
                {columns.map((col, i) => {
                    const width = finalColumnWidths[i] ?? 0;
                    const isSorted = sortColumn === i || sortColumn === col.header;
                    const justifyContent = col.align ? ALIGN_MAP[col.align] : 'flex-start';

                    return (
                        <SortableHeaderCell
                            key={i}
                            column={col}
                            width={width}
                            isSorted={isSorted}
                            sortDirection={sortDirection}
                            align={justifyContent}
                            onSort={() => onSort?.(col, i)}
                            autoFocus={i === 0}
                        />
                    );
                })}
            </Box>

            {/* Rows */}
            {data.map((item, rowIndex) => {
                const isZebra = zebra && rowIndex % 2 === 1;

                return (
                    <Box key={rowIndex} flexDirection="row">
                        {columns.map((col, colIndex) => {
                            const width = finalColumnWidths[colIndex] ?? 0;

                            let content: React.ReactNode;
                            if (typeof col.accessor === 'function') {
                                content = col.accessor(item);
                            } else {
                                const val = item[col.accessor];
                                content = val !== undefined && val !== null ? String(val) : '';
                            }

                            const justifyContent = col.align ? ALIGN_MAP[col.align] : 'flex-start';

                            return (
                                <Box
                                    key={colIndex}
                                    width={width}
                                    justifyContent={justifyContent}
                                    flexShrink={0}
                                    paddingX={1}
                                >
                                    {/* 
                                        Ink doesn't have background color on Box easily for rows. 
                                        We wrap content in Text with backgroundColor if zebra.
                                        But this only backgrounds the text characters, not the full cell width.
                                        To background full cell width, we usually need 'ink-color-pipe' or some hack.
                                        Or we use 'inverse' for zebra?
                                        'dimColor' is subtle for zebra striping on text. 
                                        Let's try: if zebra, dim the text.
                                     */}
                                    <Text dimColor={isZebra} wrap="truncate-end">
                                        {content}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}
        </Box>
    );
};
