import { Box, Text } from 'ink';
import React from 'react';
import { BigNumber, Gauge, Grid, GridItem, Panel, useTheme } from 'ink-hud';

export const LayoutPage = () => {
    const theme = useTheme();

    // ONE_DARK_PALETTES.standard: [blue, green, yellow, purple, red, cyan, orange, gray]
    const C = {
        blue:    theme.palette[0], // #61afef
        accent:  theme.palette[5], // cyan  #56b6c2
        warn:    theme.palette[2], // yellow #e5c07b
        purple:  theme.palette[3], // purple #c678dd
        success: theme.semantic.success,
        error:   theme.semantic.error,
    };

    return (
        <Box flexDirection="column" paddingX={1}>
            {/* Info bar */}
            <Box paddingX={1} marginBottom={1}>
                <Text bold color={C.accent}>
                    Layout & composition — Panel · BigNumber · Gauge · Grid
                </Text>
            </Box>

            {/* Panel borderStyle variants + BigNumber titleAlignment */}
            <Grid columns={3} rowHeight={8} widthOffset={4}>
                <GridItem>
                    <Panel
                        title="Round border — left align"
                        borderStyle="round"
                        borderColor={C.accent}
                        titleAlignment="left"
                    >
                        <BigNumber
                            value="4,291"
                            prefix="$"
                            label="Revenue"
                            color={C.accent}
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
                        borderColor={C.purple}
                        titleAlignment="center"
                    >
                        <BigNumber
                            value="98.7"
                            suffix="%"
                            label="Uptime"
                            color={C.purple}
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
                        borderColor={C.warn}
                        titleAlignment="right"
                    >
                        <BigNumber
                            value="2.1"
                            suffix="k"
                            label="Deploys"
                            color={C.warn}
                            trendDirection="down"
                            trendLabel="-3.1%"
                            align="center"
                        />
                    </Panel>
                </GridItem>
            </Grid>

            {/* Gauge variants */}
            <Grid columns={3} rowHeight={7} widthOffset={4}>
                <GridItem>
                    <Panel title="Gauge — default chars" borderColor={C.success}>
                        <Box flexDirection="column" alignItems="center" justifyContent="center">
                            <Gauge
                                value={72}
                                min={0}
                                max={100}
                                label="Load"
                                color={C.success}
                            />
                            <Text dimColor>72 / 100</Text>
                        </Box>
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Gauge — custom fillChar ⬢" borderColor={C.accent}>
                        <Box flexDirection="column" alignItems="center" justifyContent="center">
                            <Gauge
                                value={55}
                                min={0}
                                max={100}
                                label="Cache"
                                color={C.accent}
                                fillChar="⬢"
                                emptyChar="·"
                            />
                            <Text dimColor>55% filled</Text>
                        </Box>
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Gauge — negative range −50→50" borderColor={C.warn}>
                        <Box flexDirection="column" alignItems="center" justifyContent="center">
                            <Gauge
                                value={18}
                                min={-50}
                                max={50}
                                label="Drift"
                                color={C.warn}
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
                <Grid columns={12} rowHeight={5} widthOffset={4}>
                    <GridItem span={4}>
                        <Panel title="span 4" borderStyle="round" borderColor={C.blue}>
                            <Text dimColor>4/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={4}>
                        <Panel title="span 4" borderStyle="round" borderColor={C.blue}>
                            <Text dimColor>4/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={4}>
                        <Panel title="span 4" borderStyle="round" borderColor={C.blue}>
                            <Text dimColor>4/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={3}>
                        <Panel title="span 3" borderStyle="single" borderColor={C.accent}>
                            <Text dimColor>3/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={6}>
                        <Panel title="span 6 — center" borderStyle="double" borderColor={C.purple}>
                            <Text dimColor>6/12</Text>
                        </Panel>
                    </GridItem>
                    <GridItem span={3}>
                        <Panel title="span 3" borderStyle="single" borderColor={C.accent}>
                            <Text dimColor>3/12</Text>
                        </Panel>
                    </GridItem>
                </Grid>
            </Box>
        </Box>
    );
};
