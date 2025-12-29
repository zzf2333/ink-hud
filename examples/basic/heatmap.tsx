import React from 'react';
import { render, Box, Text } from 'ink';
import { Heatmap } from '../../src/components/Heatmap';
import { Panel } from '../../src/components/Panel';

// Generate simulated data (7 days x 24 hours)
const generateData = () => {
    const data: number[][] = [];
    for (let day = 0; day < 7; day++) {
        const row: number[] = [];
        for (let hour = 0; hour < 24; hour++) {
            // Simulate peak hours around 9am-5pm
            let val = Math.random() * 20;
            if (hour >= 9 && hour <= 17) {
                val += Math.random() * 80; // value range 0-100
            }
            row.push(Math.floor(val));
        }
        data.push(row);
    }
    return data;
};

const data = generateData();

const App = () => {
    return (
        <Box flexDirection="column" gap={1}>
            <Text bold>Heatmap Component Demo</Text>

            <Panel title="Server Activity (Last 7 Days)">
                <Box flexDirection="column">
                    <Box marginLeft={2} marginBottom={1}>
                        <Text color="gray">
                            00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23
                        </Text>
                    </Box>
                    <Box flexDirection="row">
                        <Box flexDirection="column" marginRight={1}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <Text key={day} color="gray">{day}</Text>
                            ))}
                        </Box>
                        <Heatmap data={data} />
                    </Box>
                </Box>
            </Panel>

            <Panel title="GitHub Style">
                <Heatmap
                    data={[
                        [0, 2, 5, 8, 10],
                        [10, 8, 5, 2, 0],
                        [5, 5, 5, 5, 5]
                    ]}
                    colors={['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']} // GitHub Palette (Light)
                />
            </Panel>
        </Box>
    );
};

render(<App />);
