/**
 * Shared deterministic test fixtures for chart components.
 * Fixed data ensures inline snapshots remain stable across runs.
 */

export const LINE_FIXTURE_SERIES = [
    { name: 'S1', data: [0, 5, 3, 8, 4, 10, 6, 9], color: 'cyan' },
    { name: 'S2', data: [2, 4, 6, 5, 7, 3, 8, 5], color: 'magenta' },
];

export const AREA_FIXTURE_SERIES = [
    { name: 'Load', data: [10, 20, 15, 25, 30, 20, 35, 28], color: 'green' },
];

export const BAR_FIXTURE_SERIES = [{ name: 'A', data: [10, 30, 20, 40, 15], color: 'blue' }];

export const PIE_FIXTURE_DATA = [
    { name: 'Alpha', value: 40, color: 'cyan' },
    { name: 'Beta', value: 35, color: 'magenta' },
    { name: 'Gamma', value: 25, color: 'yellow' },
];
