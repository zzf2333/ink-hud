#!/usr/bin/env node
/**
 * BarChart horizontal component example: Comparing two renderer charsets (Braille / Unicode Blocks)
 *
 * Optional parameters:
 *   --charset=braille|block|auto|compare
 */

import { Box, Text, render } from 'ink';
import React from 'react';
import { BarChart, InkHudProvider, Legend } from '../../src/index.ts';
import type { RendererType } from '../../src/index.ts';
import { parseCharsetMode } from '../_shared/cli';
import { getSymbolSet, symbolSetForRenderer, withSymbols } from '../_shared/symbolSets';

const charsetMode = parseCharsetMode(process.argv);
const comparedRenderers: RendererType[] = ['braille', 'block'];
const renderersToShow: Array<{ label: string; rendererOverride: RendererType | undefined; symbolSetId: 'braille' | 'unicode-blocks' | 'punctuation' }> =
    charsetMode === 'compare'
        ? comparedRenderers.map((r) => ({ label: r, rendererOverride: r, symbolSetId: symbolSetForRenderer(r) }))
        : charsetMode === 'auto'
            ? [{ label: 'auto', rendererOverride: undefined, symbolSetId: 'braille' }]
            : [{ label: charsetMode, rendererOverride: charsetMode as RendererType, symbolSetId: symbolSetForRenderer(charsetMode as RendererType) }];

const series = [
    { name: 'Read', data: [30, 45, 60, 50], color: 'green' },
    { name: 'Write', data: [20, 35, 40, 30], color: 'yellow' },
    { name: 'Wait', data: [6, 8, 5, 7], color: 'red' },
];

const legendBase = series.map((s) => ({ name: s.name, color: s.color ?? 'cyan' }));

const App = () => (
    <Box flexDirection="column" padding={1} gap={1}>
        <Text bold underline color="blue">
            BarChart (Horizontal): Comparing charsets (renderers)
        </Text>
        <Text dimColor>
            charset: <Text bold>{charsetMode}</Text> (Default: compare; Parameters: `--charset=...` / `--charset=auto`)
        </Text>

        <Box flexDirection="row" gap={2} flexWrap="wrap">
            {renderersToShow.map(({ label, rendererOverride, symbolSetId }) => {
                const set = getSymbolSet(symbolSetId);
                return (
                    <InkHudProvider key={label} renderers={rendererOverride ? { bar: rendererOverride } : undefined}>
                        <Box flexDirection="column" borderStyle="round" padding={1} width={46}>
                            <Text bold>renderer: {label}</Text>
                            <Text dimColor>legend: {set.title}</Text>
                            <Box marginTop={1}>
                                <Legend items={withSymbols(legendBase, set.symbols)} />
                            </Box>
                            <Box marginTop={1}>
                                <BarChart
                                    series={series}
                                    width={32}
                                    height={18}
                                    showLegend={false}
                                    showAxis={false}
                                    orientation="horizontal"
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
