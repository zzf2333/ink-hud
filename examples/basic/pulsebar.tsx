import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';
import { PulseBar, PingRecord, ThemeProvider, Panel } from '../../src';

const Demo = () => {
    const [records, setRecords] = useState<PingRecord[] | undefined>(undefined);

    useEffect(() => {
        // Simulate ping results
        const timer = setInterval(() => {
            const rand = Math.random();
            let status: PingRecord['status'];
            if (rand < 0.7) {
                status = 'good';
            } else if (rand < 0.9) {
                status = 'unstable';
            } else {
                status = 'bad';
            }

            setRecords((prev) => {
                const next = prev ?? [];
                return [...next.slice(-29), { status }];
            });
        }, 300);

        return () => clearInterval(timer);
    }, []);

    return (
        <ThemeProvider>
            <Box flexDirection="column" padding={1}>
                <Text bold>PulseBar demo</Text>
                <Text color="gray">Press Ctrl+C to exit</Text>

                <Box marginTop={1} flexDirection="column" gap={1}>
                    {/* Unicode style */}
                    <Panel title="Unicode style (variant='unicode')">
                        <PulseBar records={records} variant="unicode" maxBars={40} />
                    </Panel>

                    {/* ASCII style */}
                    <Panel title="ASCII style (variant='ascii')">
                        <PulseBar records={records} variant="ascii" maxBars={40} />
                    </Panel>
                </Box>

                <Box marginTop={1}>
                    <Text color="gray">
                        Legend: <Text color="green">■ Healthy</Text> <Text color="yellow">■ Unstable</Text>{' '}
                        <Text color="red">■ Failed</Text> <Text color="gray">■ No data</Text>
                    </Text>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

render(<Demo />);
