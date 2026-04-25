#!/usr/bin/env node
/**
 * PieChart component example: Comparing two renderer charsets (Braille / Unicode Blocks)
 *
 * Optional parameters:
 *   --charset=braille|block|auto|compare
 */

import { Box, Text, render } from 'ink';
import React from 'react';
import { InkHudProvider, Legend, PieChart } from '../../src/index';
import type { RendererType } from '../../src/index';
import { parseCharsetMode } from '../_shared/cli';
import { getSymbolSet, symbolSetForRenderer, withSymbols } from '../_shared/symbolSets';

const charsetMode = parseCharsetMode(process.argv);
const comparedRenderers: RendererType[] = ['braille', 'block'];
const renderersToShow: Array<{ label: string; rendererOverride: RendererType | undefined; symbolSetId: 'braille' | 'unicode-blocks' | 'ascii' }> =
    charsetMode === 'compare'
        ? comparedRenderers.map((r) => ({ label: r, rendererOverride: r, symbolSetId: symbolSetForRenderer(r) }))
        : charsetMode === 'auto'
            ? [{ label: 'auto', rendererOverride: undefined, symbolSetId: 'braille' }]
            : [{ label: charsetMode, rendererOverride: charsetMode as RendererType, symbolSetId: symbolSetForRenderer(charsetMode as RendererType) }];

const data = [
    { name: 'System', value: 30, color: 'cyan' },
    { name: 'Apps', value: 50, color: 'green' },
    { name: 'Free', value: 20, color: 'yellow' },
];

const legendBase = data.map((item) => ({ name: item.name, color: item.color ?? 'cyan' }));

const App = () => (
    <Box flexDirection="column" padding={1} gap={1}>
        <Text bold underline color="blue">
            PieChart：Comparing charsets (renderers)
        </Text>
        <Text dimColor>
            charset: <Text bold>{charsetMode}</Text> (Default: compare; Parameters: `--charset=...` / `--charset=auto`)
        </Text>

        <Box flexDirection="row" gap={2} flexWrap="wrap">
            {renderersToShow.map(({ label, rendererOverride, symbolSetId }) => {
                const set = getSymbolSet(symbolSetId);
                return (
                    <InkHudProvider key={label} renderers={rendererOverride ? { pie: rendererOverride } : undefined}>
                        <Box flexDirection="column" borderStyle="round" padding={1} width={38}>
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
                                    showLegend={false}
                                />
                            </Box>
                        </Box>
                    </InkHudProvider>
                );
            })}
        </Box>
    </Box>
);

render(<App />);
