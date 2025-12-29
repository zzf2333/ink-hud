import React from 'react';
import { render, Box, Text } from 'ink';
import { Panel } from '../../src/components/Panel';

const App = () => {
    return (
        <Box flexDirection="column" gap={1}>
            <Text bold>Panel Component Demo</Text>

            <Box flexDirection="row" gap={1}>
                <Panel title="System Status" width={40} height={10} borderStyle="round" borderColor="green">
                    <Text color="green">✓ All systems operational</Text>
                    <Text>CPU: 12%</Text>
                    <Text>Memory: 450MB</Text>
                </Panel>

                <Panel title="Alerts" titleAlignment="center" width={40} height={10} borderStyle="double" borderColor="red" padding={1}>
                    <Text color="red">⚠ Warning: High Latency</Text>
                    <Text>Region: US-East-1</Text>
                </Panel>
            </Box>

            <Panel title="Logs" titleAlignment="right" width={81} borderStyle="single" borderColor="blue">
                <Text>[INFO] Starting server...</Text>
                <Text>[INFO] Connected to database</Text>
                <Text>[WARN] Slow query detected</Text>
            </Panel>
        </Box>
    );
};

render(<App />);
