import { Box, Text } from 'ink';
import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { type FontStyle, renderBigString } from './BigNumber/font';

/**
 * Trend arrow character set
 */
const TREND_ARROWS = {
    unicode: { up: '▲', down: '▼', neutral: '─' },
    ascii: { up: '^', down: 'v', neutral: '-' },
} as const;

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
     * Trend arrow style
     * - 'unicode': Use Unicode arrows
     * - 'ascii': Use ASCII characters
     * @default 'unicode'
     */
    variant?: 'unicode' | 'ascii';

    /**
     * Large font style
     * - 'block': Block Elements characters (default)
     * - 'braille': Braille Dot Matrix characters
     * - 'ascii': Pure ASCII characters
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
    variant = 'unicode',
    fontStyle = 'block',
    align = 'center',
}) => {
    const bigLines = useMemo(() => renderBigString(String(value), fontStyle), [value, fontStyle]);

    const theme = useTheme();

    // Select arrow character based on variant
    const arrows = TREND_ARROWS[variant];

    let trendColor = theme.semantic.muted;
    let trendArrow = '';

    if (trendDirection === 'up') {
        trendColor = theme.semantic.success;
        trendArrow = arrows.up;
    } else if (trendDirection === 'down') {
        trendColor = theme.semantic.error;
        trendArrow = arrows.down;
    } else if (trendDirection === 'neutral') {
        trendArrow = arrows.neutral;
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
