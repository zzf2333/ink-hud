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
     * Custom colors
     */
    colors?: {
        good?: string;
        unstable?: string;
        bad?: string;
    };
}

const CHARS = {
    bar: '▌',
    left: '╭',
    right: '╮',
    leftBottom: '╰',
    rightBottom: '╯',
    horizontal: '─',
    vertical: '│',
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
    colors,
}) => {
    const theme = useTheme();

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

    const displayRecords = records.slice(-maxBars);
    const paddingCount = maxBars - displayRecords.length;
    const borderColor = theme.semantic.muted;
    const topBorder = CHARS.left + CHARS.horizontal.repeat(maxBars) + CHARS.right;
    const bottomBorder = CHARS.leftBottom + CHARS.horizontal.repeat(maxBars) + CHARS.rightBottom;

    return (
        <Box flexDirection="column">
            <Text color={borderColor}>{topBorder}</Text>
            <Box flexDirection="row">
                <Text color={borderColor}>{CHARS.vertical}</Text>
                {paddingCount > 0 && (
                    <Text color={borderColor}>{CHARS.bar.repeat(paddingCount)}</Text>
                )}
                {displayRecords.map((record, index) => (
                    <Text key={index} color={getColor(record.status)}>
                        {CHARS.bar}
                    </Text>
                ))}
                <Text color={borderColor}>{CHARS.vertical}</Text>
            </Box>
            <Text color={borderColor}>{bottomBorder}</Text>
        </Box>
    );
};
