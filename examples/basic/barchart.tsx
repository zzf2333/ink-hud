#!/usr/bin/env node
/**
 * BarChart component example: Comparing three legend symbol sets (Unicode Geometry / Unicode Blocks / ASCII)
 *
 * Optional parameters:
 *   --charset=braille|block|ascii|auto
 */

import { Box, Text, render } from 'ink';
import React from 'react';
import { BarChart, Legend } from '../../src/index';
import type { RendererType } from '../../src/index';
import { parseCharsetMode } from '../_shared/cli';
import { getSymbolSet, symbolSetForRenderer, withSymbols } from '../_shared/symbolSets';

const charsetMode = parseCharsetMode(process.argv);
const comparedRenderers: RendererType[] = ['braille', 'block', 'ascii'];
const renderersToShow: Array<{ label: string; renderer?: RendererType; symbolSetId: 'braille' | 'unicode-blocks' | 'ascii' }> =
    charsetMode === 'compare'
        ? comparedRenderers.map((r) => ({ label: r, renderer: r, symbolSetId: symbolSetForRenderer(r) }))
        : charsetMode === 'auto'
            ? [{ label: 'auto', renderer: undefined, symbolSetId: 'braille' }]
            : [{ label: charsetMode, renderer: charsetMode, symbolSetId: symbolSetForRenderer(charsetMode) }];

const series = [
    { name: 'Read', data: [30, 45, 60, 50], color: 'green' },
    { name: 'Write', data: [20, 35, 40, 30], color: 'yellow' },
    { name: 'Wait', data: [6, 8, 5, 7], color: 'red' },
];

const legendBase = series.map((s) => ({ name: s.name, color: s.color ?? 'cyan' }));

const App = () => (
    <Box flexDirection="column" padding={1} gap={1}>
        <Text bold underline color="blue">
            BarChart: Comparing three charsets (renderers)
        </Text>
        <Text dimColor>
            charset: <Text bold>{charsetMode}</Text> (Default: compare; Parameters: `--charset=...` / `--charset=auto`)
        </Text>

        <Box flexDirection="row" gap={2} flexWrap="wrap">
            {renderersToShow.map(({ label, renderer, symbolSetId }) => {
                const set = getSymbolSet(symbolSetId);
                return (
                    <Box key={label} flexDirection="column" borderStyle="round" padding={1} width={42}>
                        <Text bold>renderer: {label}</Text>
                        <Text dimColor>legend: {set.title}</Text>
                        <Box marginTop={1}>
                            <Legend items={withSymbols(legendBase, set.symbols)} />
                        </Box>
                        <Box marginTop={1}>
                            <BarChart
                                series={series}
                                width={38}
                                height={10}
                                renderer={renderer}
                                showLegend={false}
                                showAxis={false}
                            />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    </Box>
);

render(<App />);
