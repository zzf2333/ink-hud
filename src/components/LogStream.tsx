/**
 * LogStream - Log stream display component
 *
 * Pure log display component, without borders and title.
 * If borders are needed, please use the <Panel><LogStream /></Panel> pattern.
 */

import { Box, Text } from 'ink';
import React, { useContext, useMemo } from 'react';
import { type SemanticColors, useTheme } from '../theme/ThemeContext';
import { GridItemContext } from './Grid';

export interface LogStreamProps {
    /**
     * Array of log strings
     */
    logs: string[];

    /**
     * Maximum retained lines (counted from end)
     * @default 100
     */
    maxLines?: number;

    /**
     * Display height (number of lines)
     * If not provided, will adapt to content (but not exceed maxLines)
     */
    height?: number;

    /**
     * Display width (character count)
     * If not provided, will adapt to parent container
     */
    width?: number;
}

// Log level definitions
type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug' | 'unknown';

interface ParsedLog {
    timestamp?: string;
    level: LogLevel;
    message: string;
    raw: string;
}

/**
 * Parse log line
 */
function parseLogLine(line: string): ParsedLog {
    // Try to extract timestamp (e.g., "2023-01-01 12:00:00", "12:00:00", "[12:00:00]")
    const timeRegex = /\[?(\d{2,4}-\d{2}-\d{2}\s)?(\d{2}:\d{2}:\d{2})\]?/;
    const timeMatch = line.match(timeRegex);
    let timestamp = timeMatch ? timeMatch[0] : undefined;
    let content = line;

    if (timestamp) {
        content = content.replace(timestamp, '').trim();
        // Remove brackets if present in extracted timestamp for cleaner display
        timestamp = timestamp.replace(/^\[|\]$/g, '');
    }

    // Try to extract log level
    const levelRegex = /(info|warn|warning|error|err|success|debug)/i;
    const levelMatch = content.match(levelRegex);
    let level: LogLevel = 'unknown';

    if (levelMatch) {
        const lvl = levelMatch[0].toLowerCase();
        if (lvl.includes('error') || lvl.includes('err')) level = 'error';
        else if (lvl.includes('warn')) level = 'warn';
        else if (lvl.includes('info')) level = 'info';
        else if (lvl.includes('success')) level = 'success';
        else if (lvl.includes('debug')) level = 'debug';

        // Optional: Remove level tag from message if it's in brackets or standard format
        // e.g. "[INFO] msg" -> "msg"
        content = content.replace(new RegExp(`\\[?${levelMatch[0]}\\]?`, 'i'), '').trim();
        // Remove leading/trailing non-word chars (like ":", "-")
        content = content.replace(/^[:\-\s]+/, '');
    }

    return {
        ...(timestamp ? { timestamp } : {}),
        level,
        message: content || line,
        raw: line,
    };
}

/**
 * Render single log line
 */
interface LogLineProps {
    parsed: ParsedLog;
    semantic: SemanticColors;
    index: number;
}

const LogLine: React.FC<Omit<LogLineProps, 'index'>> = ({ parsed, semantic }) => {
    const { timestamp, level, message } = parsed;

    // Style configuration: based on semantic colors
    const getStyle = (lvl: LogLevel) => {
        switch (lvl) {
            case 'error':
                return { color: semantic.error, badge: '✖  ERROR', icon: '✖' };
            case 'warn':
                return { color: semantic.warning, badge: '⚠  WARN ', icon: '⚠' };
            case 'success':
                return { color: semantic.success, badge: '✔ SUCCESS', icon: '✔' };
            case 'debug':
                return { color: semantic.muted, badge: '⚙ DEBUG', icon: '⚙' };
            default:
                return { color: semantic.info, badge: 'ℹ  INFO ', icon: 'ℹ' };
        }
    };

    const style = getStyle(level);

    // Different display modes:
    // Mode 1: Compact icon mode (Icon + Message) - Suitable for compact layout
    // Mode 2: Full badge mode (Badge + Message) - Suitable for wide layout
    // Here we use a hybrid mode: Level with color-highlighted text

    return (
        <Box flexDirection="row" width="100%">
            {/* 1. Timestamp (Fixed width or just spacing) */}
            {timestamp && (
                <Box marginRight={1} width={10}>
                    <Text dimColor wrap="truncate">
                        {timestamp}
                    </Text>
                </Box>
            )}

            {/* 2. Level Badge/Icon */}
            {/* Use Box to give Badge a fixed width for alignment */}
            <Box marginRight={1} width={9}>
                {/* 
                   Badge Background: Ink does not support Text background color as a Badge well (except inverse),
                   So we use colored text + icons.
                   If you want "background color blocks", you can use <Text backgroundColor={style.color} color="black"> {style.badge} </Text>
                   But inverse colors may not be obvious in some terminals.
                   Here we use: Bold Color Text.
                 */}
                {level === 'unknown' ? (
                    <Text color={semantic.muted}>•</Text>
                ) : (
                    <Text color={style.color} bold>
                        {level === 'error' || level === 'warn'
                            ? `${style.icon} ${level.toUpperCase()}`
                            : level.toUpperCase()}
                    </Text>
                )}
            </Box>

            {/* 3. Message */}
            <Box flexGrow={1}>
                {level === 'error' ? (
                    <Text color={style.color} wrap="truncate-end">
                        {message}
                    </Text>
                ) : (
                    <Text color={semantic.text} wrap="truncate-end">
                        {message}
                    </Text>
                )}
            </Box>
        </Box>
    );
};

/**
 * LogStream - Scrolling log viewer component
 *
 * Features:
 * - Automatically display latest logs (render tail)
 * - Intelligently parse timestamps and log levels
 * - Use icons and colors to distinguish levels
 * - Support maximum line limit
 */
export const LogStream: React.FC<LogStreamProps> = ({ logs, maxLines = 100, height, width }) => {
    const theme = useTheme();

    // Get dimensions from Grid context
    const gridContext = useContext(GridItemContext);
    const effectiveHeight =
        height ?? (typeof gridContext?.height === 'number' ? gridContext.height : undefined);
    const effectiveWidth = width ?? gridContext?.width;

    // 1. Trim logs to maxLines
    const recentLogs = useMemo(() => {
        const start = Math.max(0, logs.length - maxLines);
        return logs.slice(start);
    }, [logs, maxLines]);

    // 2. If height limit exists, further trim to visible lines
    const displayLogs = useMemo(() => {
        if (effectiveHeight && effectiveHeight > 0) {
            const start = Math.max(0, recentLogs.length - effectiveHeight);
            return recentLogs.slice(start);
        }
        return recentLogs;
    }, [recentLogs, effectiveHeight]);

    // 3. Parse and render
    const items = displayLogs.map((line, index) => {
        const parsed = parseLogLine(line);
        return <LogLine key={index} parsed={parsed} semantic={theme.semantic} />;
    });

    return (
        <Box
            flexDirection="column"
            justifyContent="flex-end"
            flexGrow={1}
            {...(effectiveHeight !== undefined && { height: effectiveHeight })}
            {...(effectiveWidth !== undefined && { width: effectiveWidth })}
        >
            {items}
        </Box>
    );
};
