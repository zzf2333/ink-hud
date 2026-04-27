import { Box, Text } from 'ink';
import React, { useMemo } from 'react';
import { Grid, GridItem, Heatmap, Panel, Sparkline, detectImageProtocol } from 'ink-hud';
import { makeHeatmapMatrix } from '../shared/data';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GITHUB_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const HEATMAP_COLORS = ['#1e3a5f', '#1d6fa4', '#56b4d3', '#f0e442', '#e06c75'];

const sparkData = [5, 12, 8, 20, 15, 25, 18, 30, 22, 28, 35, 40, 32, 45, 38, 50, 42, 55, 48, 60];

export const ImagePage = () => {
    const matrix = useMemo(() => makeHeatmapMatrix(), []);

    const protocol = detectImageProtocol();
    const protocolLabel = protocol
        ? `${protocol} — Heatmap & gradient Sparkline will render as bitmap PNG`
        : 'none — auto mode falls back to character (■) · set INKHU_IMAGE_PROTOCOL=kitty|iterm2 to override';
    const protocolColor = protocol ? 'green' : 'yellow';

    return (
        <Box flexDirection="column" paddingX={1}>
            {/* Protocol detection banner */}
            <Box paddingX={1} marginBottom={1}>
                <Box flexDirection="column">
                    <Text bold color="cyanBright">
                        Image protocol & high-fidelity rendering
                    </Text>
                    <Text dimColor>
                        Detected:{' '}
                        <Text color={protocolColor}>{protocolLabel}</Text>
                    </Text>
                </Box>
            </Box>

            <Grid columns={2} rowHeight={12}>
                {/* Labeled heatmap — auto mode (image protocol if available) */}
                <GridItem>
                    <Panel title="Server Activity (7d × 24h) — mode=auto" borderStyle="round">
                        <Box flexDirection="column">
                            <Box marginLeft={4} marginBottom={0}>
                                <Text dimColor>
                                    {'00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23'}
                                </Text>
                            </Box>
                            <Box flexDirection="row">
                                <Box flexDirection="column" marginRight={1}>
                                    {DAYS.map((day) => (
                                        <Text key={day} dimColor>
                                            {day}
                                        </Text>
                                    ))}
                                </Box>
                                <Heatmap data={matrix} mode="auto" colors={HEATMAP_COLORS} />
                            </Box>
                        </Box>
                    </Panel>
                </GridItem>

                {/* GitHub-style heatmap — character mode */}
                <GridItem>
                    <Panel title="Contribution Grid — mode=character" borderStyle="round">
                        <Box flexDirection="column">
                            <Box marginLeft={4} marginBottom={0}>
                                <Text dimColor>Mon Tue Wed Thu Fri Sat Sun</Text>
                            </Box>
                            <Heatmap
                                mode="character"
                                data={Array.from({ length: 12 }, () =>
                                    Array.from({ length: 7 }, () =>
                                        Math.random() < 0.3 ? 0
                                            : Math.floor(Math.random() * 100),
                                    ),
                                )}
                                colors={GITHUB_COLORS}
                            />
                        </Box>
                    </Panel>
                </GridItem>
            </Grid>

            {/* Sparkline — three variants side by side */}
            <Grid columns={3} rowHeight={5}>
                <GridItem>
                    <Panel title="Sparkline — character / block" borderStyle="single">
                        <Sparkline data={sparkData} mode="character" variant="block" />
                        <Text dimColor>variant="block"</Text>
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Sparkline — character / braille" borderStyle="single">
                        <Sparkline data={sparkData} mode="character" variant="braille" />
                        <Text dimColor>variant="braille"</Text>
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="Sparkline — auto + gradient" borderStyle="single">
                        <Sparkline
                            data={sparkData}
                            mode="auto"
                            height={2}
                            colors={['#22c55e', '#eab308', '#ef4444']}
                        />
                        <Text dimColor>mode="auto" + colors gradient</Text>
                    </Panel>
                </GridItem>
            </Grid>
        </Box>
    );
};
