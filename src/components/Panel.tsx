import { Box, type BoxProps, Text } from 'ink';
import React from 'react';
import { GridItemContext } from './Grid';

export interface PanelProps {
    /**
     * Panel title
     */
    title?: string;

    /**
     * Title alignment
     * @default 'left'
     */
    titleAlignment?: 'left' | 'center' | 'right';

    /**
     * Border style
     * @default 'round'
     */
    borderStyle?: BoxProps['borderStyle'];

    /**
     * Border color
     * @default 'white'
     */
    borderColor?: string;

    /**
     * Content padding
     * @default 0
     */
    padding?: number;

    /**
     * Panel width
     */
    width?: number | string;

    /**
     * Panel height
     */
    height?: number | string;

    /**
     * Children (content)
     */
    children: React.ReactNode;
}

/**
 * Panel - Card component with title and border
 *
 * Unified encapsulation of borders, titles, and padding, supporting various border styles.
 */
export const Panel: React.FC<PanelProps> = ({
    title,
    titleAlignment = 'left',
    borderStyle = 'round',
    borderColor,
    padding = 0,
    width,
    height,
    children,
}) => {
    // 1. Resolve dimensions from props or context
    const gridContext = React.useContext(GridItemContext);

    // Effective dimensions (Outer dimensions of the Panel)
    const effectiveWidth = width ?? gridContext?.width;
    const effectiveHeight = height ?? gridContext?.height;

    // 2. Calculate inner available space for children
    // If we have explicit or context dimensions, subtract borders and padding
    // Border always consumes 2 units (1 left, 1 right / 1 top, 1 bottom) if active
    // Standard Ink Box border consumes space.
    const borderOverhead = borderStyle ? 2 : 0;
    const paddingOverhead = padding * 2;
    const totalOverhead = borderOverhead + paddingOverhead;

    const innerWidth = typeof effectiveWidth === 'number'
        ? Math.max(0, effectiveWidth - totalOverhead)
        : undefined;

    const innerHeight = typeof effectiveHeight === 'number'
        ? Math.max(0, effectiveHeight - totalOverhead)
        : undefined;

    // 3. Prepare Box props
    const boxProps: BoxProps = {
        borderStyle,
        flexDirection: 'column',
        ...(effectiveWidth !== undefined && { width: effectiveWidth }),
        ...(effectiveHeight !== undefined && { height: effectiveHeight }),
        ...(borderColor !== undefined && { borderColor }),
    };

    // 4. Update Context for children
    // We memoize the context value to prevent unnecessary re-renders
    const childContext = React.useMemo(() => ({
        ...(innerWidth !== undefined ? { width: innerWidth } : {}),
        height: innerHeight
    }), [innerWidth, innerHeight]);

    // Note: If innerWidth is undefined (e.g. Panel width is '100%'), we might not be able to pass a number.
    // However, chartUtils useChartLayout falls back to defaultWidth if context width is missing.
    // Ideally we pass what we know.

    return (
        <GridItemContext.Provider value={childContext}>
            <Box {...boxProps}>
                {title && (
                    <Box
                        position="absolute"
                        marginTop={-1}
                        width="100%"
                        paddingX={2}
                        justifyContent={
                            titleAlignment === 'center'
                                ? 'center'
                                : titleAlignment === 'right'
                                    ? 'flex-end'
                                    : 'flex-start'
                        }
                    >
                        <Text bold color={borderColor || 'white'}>
                            {' '}
                            {title}{' '}
                        </Text>
                    </Box>
                )}
                <Box padding={padding} flexDirection="column" flexGrow={1}>
                    {children}
                </Box>
            </Box>
        </GridItemContext.Provider>
    );
};
