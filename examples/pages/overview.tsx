import { Box, Text } from 'ink';
import React from 'react';
import {
    BigNumber,
    Gauge,
    Grid,
    GridItem,
    LineChart,
    Panel,
    Sparkline,
    useTheme,
} from 'ink-hud';
import { useSystemMetrics } from '../shared/data';

export const OverviewPage = () => {
    const m = useSystemMetrics();
    const theme = useTheme();

    // ONE_DARK_PALETTES.standard: [blue, green, yellow, purple, red, cyan, orange, gray]
    const C = {
        accent:  theme.palette[5], // cyan  #56b6c2
        warn:    theme.palette[2], // yellow #e5c07b
        purple:  theme.palette[3], // purple #c678dd
        success: theme.semantic.success,
        error:   theme.semantic.error,
    };

    const errorColor = m.errorRate > 1 ? C.error : C.success;

    return (
        <Box flexDirection="column" paddingX={1}>
            {/* Header */}
            <Box
                borderStyle="round"
                borderColor={C.accent}
                paddingX={2}
                marginBottom={1}
                justifyContent="space-between"
            >
                <Box flexDirection="column">
                    <Text bold color={C.accent}>
                        ink-hud showcase
                    </Text>
                    <Text dimColor>system monitor · live metrics</Text>
                </Box>
                <Box flexDirection="column" alignItems="flex-end">
                    <Text color={C.success}>● ONLINE</Text>
                    <Text dimColor>{new Date().toLocaleTimeString()}</Text>
                </Box>
            </Box>

            {/* KPI row — BigNumber with trendDirection + trendLabel */}
            <Grid columns={4} rowHeight={7}>
                <GridItem>
                    <Panel title="Requests/s" borderColor={C.accent}>
                        <BigNumber
                            value={m.reqs.toLocaleString('en-US')}
                            label="req/s"
                            color={C.accent}
                            trendDirection={m.reqsTrend >= 0 ? 'up' : 'down'}
                            trendLabel={`${m.reqsTrend >= 0 ? '+' : ''}${m.reqsTrend}%`}
                            align="center"
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="p99 Latency" borderColor={C.warn}>
                        <BigNumber
                            value={m.latency}
                            suffix="ms"
                            label="p99"
                            color={C.warn}
                            trendDirection={m.latencyTrend <= 0 ? 'up' : 'down'}
                            trendLabel={`${m.latencyTrend >= 0 ? '+' : ''}${m.latencyTrend}%`}
                            align="center"
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Error Rate" borderColor={errorColor}>
                        <BigNumber
                            value={m.errorRate}
                            suffix="%"
                            label="errors"
                            color={errorColor}
                            trendDirection={m.errorTrend <= 0 ? 'up' : 'down'}
                            trendLabel={`${m.errorTrend >= 0 ? '+' : ''}${m.errorTrend}`}
                            align="center"
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Active Users" borderColor={C.purple}>
                        <BigNumber
                            value={m.activeUsers.toLocaleString('en-US')}
                            label="users"
                            color={C.purple}
                            trendDirection={m.usersTrend >= 0 ? 'up' : 'down'}
                            trendLabel={`${m.usersTrend >= 0 ? '+' : ''}${m.usersTrend}%`}
                            align="center"
                        />
                    </Panel>
                </GridItem>
            </Grid>

            {/* Main chart + gauges */}
            <Grid columns={5} rowHeight={14}>
                <GridItem span={4}>
                    <Panel title="Throughput — CPU / Memory / Network" borderStyle="round">
                        <LineChart
                            series={m.throughput}
                            showLegend
                            showAxis
                            legendPosition="bottom"
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Box flexDirection="column" height={12}>
                        <Box height={6}>
                            <Panel title="CPU" height={6}>
                                <Box flexDirection="column" alignItems="center">
                                    <Gauge
                                        value={m.cpu}
                                        min={0}
                                        max={100}
                                        color={m.cpu > 80 ? C.error : m.cpu > 60 ? C.warn : C.success}
                                    />
                                    <Text dimColor>{Math.round(m.cpu)}%</Text>
                                </Box>
                            </Panel>
                        </Box>
                        <Box height={6}>
                            <Panel title="Memory" height={6}>
                                <Box flexDirection="column" alignItems="center">
                                    <Gauge
                                        value={m.memory}
                                        min={0}
                                        max={100}
                                        color={m.memory > 85 ? C.error : C.accent}
                                    />
                                    <Text dimColor>{Math.round(m.memory)}%</Text>
                                </Box>
                            </Panel>
                        </Box>
                    </Box>
                </GridItem>
            </Grid>

            {/* Sparklines — block / braille / image-mode with gradient */}
            <Grid columns={3} rowHeight={4}>
                <GridItem>
                    <Panel title="CPU — block variant" borderStyle="single" borderColor={C.accent}>
                        <Sparkline
                            data={m.sparkCpu}
                            mode="character"
                            variant="block"
                            color={C.accent}
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Memory — braille variant" borderStyle="single" borderColor={C.purple}>
                        <Sparkline
                            data={m.sparkMem}
                            mode="character"
                            variant="braille"
                            color={C.purple}
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Network — auto + gradient" borderStyle="single" borderColor={C.warn}>
                        <Sparkline
                            data={m.sparkNet}
                            mode="auto"
                            color={C.warn}
                            colors={[C.success, C.warn, C.error]}
                        />
                    </Panel>
                </GridItem>
            </Grid>
        </Box>
    );
};
