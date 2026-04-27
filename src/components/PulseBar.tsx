import { Box, Text } from 'ink';
import React from 'react';
import { BORDER_ROUNDED } from '../symbols';
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

/**
 * PulseBar - network connection status component
 *
 * Shows ping history, each bar represents a ping result:
 * - Green: connection healthy
 * - Yellow: connection unstable
 * - Red: connection failed
 */
export const PulseBar: React.FC<PulseBarProps> = ({ records = [], maxBars = 30, colors }) => {
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
    const topBorder =
        BORDER_ROUNDED.topLeft +
        BORDER_ROUNDED.horizontal.repeat(maxBars) +
        BORDER_ROUNDED.topRight;
    const bottomBorder =
        BORDER_ROUNDED.bottomLeft +
        BORDER_ROUNDED.horizontal.repeat(maxBars) +
        BORDER_ROUNDED.bottomRight;

    return (
        <Box flexDirection="column">
            <Text color={borderColor}>{topBorder}</Text>
            <Box flexDirection="row">
                <Text color={borderColor}>{BORDER_ROUNDED.vertical}</Text>
                {paddingCount > 0 && (
                    <Text color={borderColor}>{BORDER_ROUNDED.bar.repeat(paddingCount)}</Text>
                )}
                {displayRecords.map((record, index) => (
                    <Text key={index} color={getColor(record.status)}>
                        {BORDER_ROUNDED.bar}
                    </Text>
                ))}
                <Text color={borderColor}>{BORDER_ROUNDED.vertical}</Text>
            </Box>
            <Text color={borderColor}>{bottomBorder}</Text>
        </Box>
    );
};
