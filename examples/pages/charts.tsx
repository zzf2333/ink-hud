import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';
import {
    AreaChart,
    BarChart,
    Grid,
    GridItem,
    InkHudProvider,
    LineChart,
    Panel,
    PieChart,
} from 'ink-hud';
import {
    CHART_AREA_SERIES,
    CHART_BAR_SERIES,
    CHART_HBAR_SERIES,
    CHART_LINE_SERIES,
    CHART_PIE_DATA,
} from '../shared/data';

export const ChartsPage = () => {
    const [barMode, setBarMode] = useState<'block' | 'braille'>('block');

    useInput((input) => {
        if (input === 'r') {
            setBarMode((prev) => (prev === 'block' ? 'braille' : 'block'));
        }
    });

    return (
        <Box flexDirection="column" paddingX={1}>
            {/* Info bar */}
            <Box paddingX={1} marginBottom={1}>
                <Box flexDirection="column">
                    <Text bold color="cyanBright">
                        Chart components — LineChart · AreaChart · BarChart · PieChart
                    </Text>
                    <Text dimColor>
                        Renderer: line=braille area=braille bar=
                        <Text color={barMode === 'braille' ? 'magenta' : 'yellow'}>{barMode}</Text>
                        {' '}pie=braille{'  '}
                        <Text bold color="white">[r]</Text>
                        {' '}toggle bar renderer
                    </Text>
                </Box>
            </Box>

            {/* Override bar renderer via nested InkHudProvider */}
            <InkHudProvider renderers={{ bar: barMode }}>
                {/* 2×2 chart grid */}
                <Grid columns={2} rowHeight={14}>
                    <GridItem>
                        <Panel title="LineChart — Requests & Errors" borderStyle="round">
                            <LineChart
                                series={CHART_LINE_SERIES}
                                showLegend
                                showAxis
                                legendPosition="right"
                            />
                        </Panel>
                    </GridItem>
                    <GridItem>
                        <Panel title="AreaChart — Traffic & Cached" borderStyle="round">
                            <AreaChart
                                series={CHART_AREA_SERIES}
                                showLegend
                                showAxis
                                legendPosition="right"
                            />
                        </Panel>
                    </GridItem>
                    <GridItem>
                        <Panel
                            title={`BarChart — Read & Write (vertical, ${barMode})`}
                            borderStyle="round"
                        >
                            <BarChart
                                series={CHART_BAR_SERIES}
                                showLegend
                                orientation="vertical"
                            />
                        </Panel>
                    </GridItem>
                    <GridItem>
                        <Panel title="PieChart — Request breakdown" borderStyle="round">
                            <PieChart
                                data={CHART_PIE_DATA}
                                showLegend
                                showLabels
                                legendPosition="right"
                            />
                        </Panel>
                    </GridItem>
                </Grid>

                {/* Horizontal BarChart */}
                <Grid columns={1} rowHeight={7}>
                    <GridItem>
                        <Panel title="BarChart — horizontal orientation">
                            <BarChart
                                series={CHART_HBAR_SERIES}
                                showLegend={false}
                                orientation="horizontal"
                            />
                        </Panel>
                    </GridItem>
                </Grid>
            </InkHudProvider>
        </Box>
    );
};
