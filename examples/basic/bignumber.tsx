import React from 'react';
import { render, Box, Text } from 'ink';
import { BigNumber } from '../../src/components/BigNumber';
import { Panel } from '../../src/components/Panel';

const App = () => {
    return (
        <Box flexDirection="column" gap={1}>
            <Text bold>BigNumber Component Demo</Text>

            <Box flexDirection="row" gap={2}>
                <Panel title="Revenue" width={40}>
                    <BigNumber
                        value="92.4"
                        label="Total Sales"
                        trendDirection="up"
                        trendLabel="12% MoM"
                        color="green"
                    />
                </Panel>
                <Panel title="Churn" width={30}>
                    <BigNumber
                        value="1.2%"
                        label="Monthly Churn"
                        trendDirection="down"
                        trendLabel="0.5%"
                        color="red"
                    />
                </Panel>
            </Box>

            <Panel title="Active Users">
                <BigNumber value="1285" label="Online Now" color="cyan" />
            </Panel>
        </Box>
    );
};

render(<App />);
