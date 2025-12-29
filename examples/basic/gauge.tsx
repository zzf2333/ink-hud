import React from 'react';
import { render, Box, Text } from 'ink';
import { Gauge } from '../../src/components/Gauge';
import { Panel } from '../../src/components/Panel';

const App = () => {
    return (
        <Box flexDirection="column" gap={1}>
            <Text bold>Gauge Component Demo</Text>

            <Panel title="System Load">
                <Gauge label="CPU " value={45} color="green" />
                <Gauge label="MEM " value={75} color="yellow" />
                <Gauge label="DSK " value={92} color="red" />
            </Panel>

            <Panel title="Custom Characters">
                <Gauge
                    label="Loading: "
                    value={60}
                    fillChar="="
                    emptyChar="-"
                    color="blue"
                    showPercent={true}
                />
                <Gauge
                    label="Progress:"
                    value={30}
                    fillChar="▓"
                    emptyChar="░"
                    color="cyan"
                />
            </Panel>

            <Panel title="Width & Ranges">
                <Gauge label="Small" value={50} width={10} />
                <Gauge label="Large" value={50} width={40} />
                <Gauge label="Range -50 to 50 (val: 0)" value={0} min={-50} max={50} color="magenta" />
            </Panel>
        </Box>
    );
};

render(<App />);
