/**
 * ink-hud visual symbol constants
 *
 * Centralised character table — grouped by purpose, not Unicode block.
 * Components import from here instead of hard-coding characters inline.
 * All entries are `as const` — stable references safe to use in object keys.
 */

/** Trend direction arrows (BigNumber, Table) */
export const TREND = { up: '▲', down: '▼', neutral: '─' } as const;

/** Legend dot marker (PieChart, Legend, chart core) */
export const LEGEND = { dot: '●' } as const;

/** Filled / empty bar characters (Gauge) */
export const BAR = { fill: '█', empty: '░' } as const;

/** Default character for heatmap cells in character mode */
export const HEATMAP = { default: '■' } as const;

/** Rounded-box border characters (PulseBar) */
export const BORDER_ROUNDED = {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
    bar: '▌',
} as const;

/** Multi-level bar characters for Sparkline character mode */
export const SPARK_LEVELS = {
    block:   [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const,
    braille: ['⠀', '⡀', '⣀', '⣄', '⣤', '⣦', '⣶', '⣷', '⣿'] as const,
} as const;
