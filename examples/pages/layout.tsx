import { Box, Text } from 'ink';
import React from 'react';
import { BigNumber, Gauge, Grid, GridItem, Panel } from 'ink-hud';

export const LayoutPage = () => {
    return (
        <Box flexDirection="column" paddingX={1}>
            {/* Info bar */}
            <Box paddingX={1} marginBottom={1}>
                <Text bold color="cyanBright">
                    Layout & composition — Panel · BigNumber · Gauge · Grid
                </Text>
            </Box>

            {/* Panel borderStyle variants + BigNumber titleAlignment */}
            <Grid columns={3} rowHeight={8}>
                <GridItem>
                    <Panel
                        title="Round border — left align"
                        borderStyle="round"
                        borderColor="cyan"
                        titleAlignment="left"
                    >
                        <BigNumber
                            value="$4,291"
                            label="Revenue"
                            color="cyan"
                            trendDirection="up"
                            trendLabel="+12.4%"
                            align="center"
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel
                        title="Double border — center"
                        borderStyle="double"
                        borderColor="magenta"
                        titleAlignment="center"
                    >
                        <BigNumber
                            value="98.7%"
                            label="Uptime"
                            color="magenta"
                            trendDirection="neutral"
                            trendLabel="stable"
                            align="center"
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel
                        title="Single border — right"
                        borderStyle="single"
                        borderColor="yellow"
                        titleAlignment="right"
                    >
                        <BigNumber
                            value="2.1k"
                            label="Deploys"
                            color="yellow"
                            trendDirection="down"
                            trendLabel="-3.1%"
                            align="center"
                        />
                    </Panel>
                </GridItem>
            </Grid>

            {/* Gauge variants */}
            <Grid columns={3} rowHeight={7}>
                <GridItem>
                    <Panel title="Gauge — default chars" borderColor="green">
                        <Box flexDirection="column" alignItems="center" justifyContent="center">
                            <Gauge
                                value={72}
                                min={0}
                                max={100}
                                label="Load"
                                color="green"
                            />
                            <Text dimColor>72 / 100</Text>
                        </Box>
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Gauge — custom fillChar ⬢" borderColor="cyan">
                        <Box flexDirection="column" alignItems="center" justifyContent="center">
                            <Gauge
                                value={55}
                                min={0}
                                max={100}
                                label="Cache"
                                color="cyan"
                                fillChar="⬢"
                                emptyChar="·"
                            />
                            <Text dimColor>55% filled</Text>
                        </Box>
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Gauge — negative range −50→50" borderColor="yellow">
                        <Box flexDirection="column" alignItems="center" justifyContent="center">
                            <Gauge
                                value={18}
                                min={-50}
                                max={50}
                                label="Drift"
                                color="yellow"
                            />
                            <Text dimColor>value: +18 ms</Text>
                        </Box>
                    </Panel>
                </GridItem>
            </Grid>

            {/* Grid span layout showcase */}
            <Box marginTop={0}>
                <Box paddingX={1} marginBottom={0}>
                    <Text dimColor>Grid columns=12 · span composition →</Text>
                </Box>
                <Grid columns={12} rowHeight={5}>
                    <GridItem span={4}>
                        <Panel title="span 4" borderStyle="round" borderColor="blue">
                            <Text dimColor>4/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={4}>
                        <Panel title="span 4" borderStyle="round" borderColor="blue">
                            <Text dimColor>4/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={4}>
                        <Panel title="span 4" borderStyle="round" borderColor="blue">
                            <Text dimColor>4/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={3}>
                        <Panel title="span 3" borderStyle="single" borderColor="cyan">
                            <Text dimColor>3/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={6}>
                        <Panel title="span 6 — center" borderStyle="double" borderColor="magenta">
                            <Text dimColor>6/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={3}>
                        <Panel title="span 3" borderStyle="single" borderColor="cyan">
                            <Text dimColor>3/12</Text>
                        </Panel>
                    </GridItem>
                </Grid>
            </Box>
        </Box>
    );
};
