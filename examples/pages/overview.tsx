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
} from 'ink-hud';
import { useSystemMetrics } from '../shared/data';

export const OverviewPage = () => {
    const m = useSystemMetrics();

    return (
        <Box flexDirection="column" paddingX={1}>
            {/* Header */}
            <Box
                borderStyle="round"
                borderColor="cyan"
                paddingX={2}
                marginBottom={1}
                justifyContent="space-between"
            >
                <Box flexDirection="column">
                    <Text bold color="cyanBright">
                        ink-hud showcase
                    </Text>
                    <Text dimColor>system monitor · live metrics</Text>
                </Box>
                <Box flexDirection="column" alignItems="flex-end">
                    <Text color="green">● ONLINE</Text>
                    <Text dimColor>{new Date().toLocaleTimeString()}</Text>
                </Box>
            </Box>

            {/* KPI row — BigNumber with trendDirection + trendLabel */}
            <Grid columns={4} rowHeight={7}>
                <GridItem>
                    <Panel title="Requests/s" borderColor="cyan">
                        <BigNumber
                            value={m.reqs.toLocaleString()}
                            label="req/s"
                            color="cyan"
                            trendDirection={m.reqsTrend >= 0 ? 'up' : 'down'}
                            trendLabel={`${m.reqsTrend >= 0 ? '+' : ''}${m.reqsTrend}%`}
                            align="center"
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="p99 Latency" borderColor="yellow">
                        <BigNumber
                            value={`${m.latency}ms`}
                            label="p99"
                            color="yellow"
                            trendDirection={m.latencyTrend <= 0 ? 'up' : 'down'}
                            trendLabel={`${m.latencyTrend >= 0 ? '+' : ''}${m.latencyTrend}%`}
                            align="center"
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Error Rate" borderColor={m.errorRate > 1 ? 'red' : 'green'}>
                        <BigNumber
                            value={`${m.errorRate}%`}
                            label="errors"
                            color={m.errorRate > 1 ? 'red' : 'green'}
                            trendDirection={m.errorTrend <= 0 ? 'up' : 'down'}
                            trendLabel={`${m.errorTrend >= 0 ? '+' : ''}${m.errorTrend}`}
                            align="center"
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Active Users" borderColor="magenta">
                        <BigNumber
                            value={m.activeUsers.toLocaleString()}
                            label="users"
                            color="magenta"
                            trendDirection={m.usersTrend >= 0 ? 'up' : 'down'}
                            trendLabel={`${m.usersTrend >= 0 ? '+' : ''}${m.usersTrend}%`}
                            align="center"
                        />
                    </Panel>
                </GridItem>
            </Grid>

            {/* Main chart + gauges */}
            <Grid columns={5} rowHeight={12}>
                <GridItem span={4}>
                    <Panel title="Throughput — CPU / Memory / Network" borderStyle="round">
                        <LineChart
                            series={m.throughput}
                            showLegend
                            showAxis
                            legendPosition="right"
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
                                        color={m.cpu > 80 ? 'red' : m.cpu > 60 ? 'yellow' : 'green'}
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
                                        color={m.memory > 85 ? 'red' : 'cyan'}
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
                    <Panel title="CPU — block variant" borderStyle="single">
                        <Sparkline data={m.sparkCpu} mode="character" variant="block" />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Memory — braille variant" borderStyle="single">
                        <Sparkline data={m.sparkMem} mode="character" variant="braille" />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Network — auto + gradient" borderStyle="single">
                        <Sparkline
                            data={m.sparkNet}
                            mode="auto"
                            colors={['#22c55e', '#eab308', '#ef4444']}
                        />
                    </Panel>
                </GridItem>
            </Grid>
        </Box>
    );
};
