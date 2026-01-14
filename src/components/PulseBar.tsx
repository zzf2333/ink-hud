import { Box, Text } from 'ink';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';

/**
 * Status for a single ping
 */
export type PingStatus = 'good' | 'unstable' | 'bad';

/**
 * Ping record item
 */
export interface PingRecord {
    /**
     * Connection status
     */
    status: PingStatus;
}

export interface PulseBarProps {
    /**
     * Ping history entries
     */
    records?: PingRecord[];

    /**
     * Maximum number of bars to display
     * @default 30
     */
    maxBars?: number;

    /**
     * Render style
     * - 'unicode': use Unicode characters
     * - 'ascii': use ASCII characters
     * @default 'unicode'
     */
    variant?: 'unicode' | 'ascii';

    /**
     * Custom colors
     */
    colors?: {
        good?: string;
        unstable?: string;
        bad?: string;
    };
}

/**
 * Character set configuration
 */
const CHAR_SETS = {
    unicode: {
        bar: '▌',
        left: '╭',
        right: '╮',
        leftBottom: '╰',
        rightBottom: '╯',
        horizontal: '─',
        vertical: '│',
    },
    ascii: {
        bar: '|',
        left: '/',
        right: '\\',
        leftBottom: '\\',
        rightBottom: '/',
        horizontal: '-',
        vertical: '|',
    },
} as const;

/**
 * PulseBar - network connection status component
 *
 * Shows ping history, each bar represents a ping result:
 * - Green: connection healthy
 * - Yellow: connection unstable
 * - Red: connection failed
 */
export const PulseBar: React.FC<PulseBarProps> = ({
    records = [],
    maxBars = 30,
    variant = 'unicode',
    colors,
}) => {
    const theme = useTheme();
    const chars = CHAR_SETS[variant];

    // Resolve the color for each status
    const getColor = (status: PingStatus): string => {
        switch (status) {
            case 'good':
                return colors?.good ?? theme.semantic.success;
            case 'unstable':
                return colors?.unstable ?? theme.semantic.warning;
            case 'bad':
                return colors?.bad ?? theme.semantic.error;
        }
    };

    // Keep the most recent maxBars entries
    const displayRecords = records.slice(-maxBars);
    // Fill remaining slots with empty bars
    const paddingCount = maxBars - displayRecords.length;

    // Border color
    const borderColor = theme.semantic.muted;

    // Top border
    const topBorder = chars.left + chars.horizontal.repeat(maxBars) + chars.right;
    // Bottom border
    const bottomBorder = chars.leftBottom + chars.horizontal.repeat(maxBars) + chars.rightBottom;

    return (
        <Box flexDirection="column">
            <Text color={borderColor}>{topBorder}</Text>
            <Box flexDirection="row">
                <Text color={borderColor}>{chars.vertical}</Text>
                {/* Fill empty slots with muted bars */}
                {paddingCount > 0 && (
                    <Text color={borderColor}>{chars.bar.repeat(paddingCount)}</Text>
                )}
                {/* Render each ping record */}
                {displayRecords.map((record, index) => (
                    <Text key={index} color={getColor(record.status)}>
                        {chars.bar}
                    </Text>
                ))}
                <Text color={borderColor}>{chars.vertical}</Text>
            </Box>
            <Text color={borderColor}>{bottomBorder}</Text>
        </Box>
    );
};
