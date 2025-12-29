#!/usr/bin/env node
import { Box, Text, render } from 'ink';
import React, { useState, useEffect } from 'react';
import { Sparkline } from '../../src/index';

const App = () => {
    // Simulated data updates
    const [cpuData, setCpuData] = useState([10, 20, 15, 25, 30, 45, 50, 40, 35, 20]);
    const [memData, setMemData] = useState([45, 46, 47, 48, 50, 52, 55, 53, 50, 48]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCpuData((prev) => [...prev.slice(1), Math.floor(Math.random() * 60) + 10]);
            setMemData((prev) => [...prev.slice(1), Math.floor(Math.random() * 20) + 40]);
        }, 500);
        return () => clearInterval(timer);
    }, []);

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold>Sparkline Demo (Mini Trend Charts)</Text>
            <Box marginTop={1} flexDirection="column" gap={1}>
                <Box>
                    <Text bold>Block (Default):</Text>
                    <Text>
                        CPU: <Text color="yellow">{cpuData[cpuData.length - 1]}%</Text>{' '}
                        <Sparkline data={cpuData} min={0} max={100} color="green" variant="block" />
                    </Text>
                </Box>
                <Box>
                    <Text bold>Braille:</Text>
                    <Text>
                        Mem: <Text color="cyan">{memData[memData.length - 1]}%</Text>{' '}
                        <Sparkline data={memData} min={0} max={100} color="blue" variant="braille" />
                    </Text>
                </Box>
                <Box>
                    <Text bold>ASCII:</Text>
                    <Text>
                        Load: <Text color="red">{Math.round(cpuData[cpuData.length - 1] / 10)}</Text>{' '}
                        <Sparkline data={cpuData} min={0} max={100} color="magenta" variant="ascii" />
                    </Text>
                </Box>
            </Box>
            <Box marginTop={1}>
                <Text dimColor>
                    Inline text example: The server load is <Sparkline data={[10, 30, 60, 90, 40, 20]} color="red" /> right now.
                </Text>
            </Box>
        </Box>
    );
};

render(<App />);
