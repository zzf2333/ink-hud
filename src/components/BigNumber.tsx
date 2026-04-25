import { Box, Text } from 'ink';
import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { type FontStyle, renderBigString } from './BigNumber/font';

const TREND_ARROWS = { up: '▲', down: '▼', neutral: '─' } as const;

export interface BigNumberProps {
    /**
     * Main value
     */
    value: string | number;

    /**
     * Subtitle/label
     */
    label?: string;

    /**
     * Color
     * @default 'white'
     */
    color?: string;

    /**
     * Trend direction (for rendering arrows)
     */
    trendDirection?: 'up' | 'down' | 'neutral';

    /**
     * Trend label (e.g., "12%")
     */
    trendLabel?: string;

    /**
     * Large font style
     * - 'block': Block Elements characters (default)
     * - 'braille': Braille Dot Matrix characters
     * @default 'block'
     */
    fontStyle?: FontStyle;

    /**
     * Alignment
     * @default 'center'
     */
    align?: 'left' | 'center' | 'right';
}

/**
 * BigNumber - Key metric card component
 *
 * Display core KPIs with large font for main value, supports subtitle and trend indicators.
 */
export const BigNumber: React.FC<BigNumberProps> = ({
    value,
    label,
    color = 'white',
    trendDirection,
    trendLabel,
    fontStyle = 'block',
    align = 'center',
}) => {
    const bigLines = useMemo(() => renderBigString(String(value), fontStyle), [value, fontStyle]);

    const theme = useTheme();

    let trendColor = theme.semantic.muted;
    let trendArrow = '';

    if (trendDirection === 'up') {
        trendColor = theme.semantic.success;
        trendArrow = TREND_ARROWS.up;
    } else if (trendDirection === 'down') {
        trendColor = theme.semantic.error;
        trendArrow = TREND_ARROWS.down;
    } else if (trendDirection === 'neutral') {
        trendArrow = TREND_ARROWS.neutral;
    }

    const alignItems =
        align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

    return (
        <Box flexDirection="column" alignItems={alignItems}>
            <Box flexDirection="column" marginBottom={1}>
                {bigLines.map((line, i) => (
                    <Text key={i} color={color}>
                        {line}
                    </Text>
                ))}
            </Box>

            <Box flexDirection="row" gap={1}>
                {label && <Text color={theme.semantic.textSecondary}>{label}</Text>}
                {(trendLabel || trendArrow) && (
                    <Text color={trendColor}>
                        {trendArrow} {trendLabel}
                    </Text>
                )}
            </Box>
        </Box>
    );
};
