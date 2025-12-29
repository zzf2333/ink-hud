#!/usr/bin/env node
/**
 * PieChart component example: Comparing three legend symbol sets (Unicode Geometry / Unicode Blocks / ASCII)
 *
 * Optional parameters:
 *   --charset=braille|block|ascii|auto
 */

import { Box, Text, render } from 'ink';
import React from 'react';
import { Legend, PieChart } from '../../src/index';
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

const data = [
    { name: 'System', value: 30, color: 'cyan' },
    { name: 'Apps', value: 50, color: 'green' },
    { name: 'Free', value: 20, color: 'yellow' },
];

const legendBase = data.map((item) => ({ name: item.name, color: item.color ?? 'cyan' }));

const App = () => (
    <Box flexDirection="column" padding={1} gap={1}>
        <Text bold underline color="blue">
            PieChart：Comparing three charsets (renderers)
        </Text>
        <Text dimColor>
            charset: <Text bold>{charsetMode}</Text> (Default: compare; Parameters: `--charset=...` / `--charset=auto`)
        </Text>

        <Box flexDirection="row" gap={2} flexWrap="wrap">
            {renderersToShow.map(({ label, renderer, symbolSetId }) => {
                const set = getSymbolSet(symbolSetId);
                return (
                    <Box key={label} flexDirection="column" borderStyle="round" padding={1} width={38}>
                        <Text bold>renderer: {label}</Text>
                        <Text dimColor>legend: {set.title}</Text>
                        <Box marginTop={1}>
                            <Legend items={withSymbols(legendBase, set.symbols)} />
                        </Box>
                        <Box marginTop={1}>
                            <PieChart
                                data={data}
                                width={20}
                                height={10}
                                renderer={renderer}
                                showLegend={false}
                            />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    </Box>
);

render(<App />);
