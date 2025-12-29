#!/usr/bin/env node
/**
 * LineChart component example: Comparing three legend symbol sets (Unicode Geometry / Unicode Blocks / ASCII)
 *
 * Optional parameters:
 *   --charset=braille|block|ascii|auto
 */

import { Box, Text, render } from 'ink';
import React from 'react';
import { Legend, LineChart } from '../../src/index';
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
    { name: 'Requests', data: [12, 18, 22, 20, 26, 30, 28, 34, 40, 38], color: 'cyan' },
    { name: 'Errors', data: [1, 2, 1, 3, 2, 4, 3, 2, 3, 2], color: 'red' },
    { name: 'Latency', data: [80, 95, 90, 110, 105, 120, 115, 98, 102, 108], color: 'yellow' },
];

const legendBase = series.map((s) => ({ name: s.name, color: s.color ?? 'cyan' }));

const App = () => (
    <Box flexDirection="column" padding={1} gap={1}>
        <Text bold underline color="blue">
            LineChart：Comparing three charsets (renderers)
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
                            <LineChart
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
