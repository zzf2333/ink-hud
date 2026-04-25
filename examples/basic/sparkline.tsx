#!/usr/bin/env node
import { Box, Text, render } from 'ink';
import React, { useState, useEffect } from 'react';
import { Sparkline } from '../../src/index';
import { detectImageProtocol } from '../../src/render/capabilities';

const imageProtocol = detectImageProtocol();
const imageNote = imageProtocol
    ? `Image protocol: ${imageProtocol} (image mode active)`
    : 'No image protocol — using character mode. Set INKHU_IMAGE_PROTOCOL=kitty|iterm2 to override.';

const App = () => {
    const [cpuData, setCpuData] = useState([10, 20, 15, 25, 30, 45, 50, 40, 35, 20]);
    const [memData, setMemData] = useState([45, 46, 47, 48, 50, 52, 55, 53, 50, 48]);
    const [networkData, setNetworkData] = useState(
        Array.from({ length: 30 }, (_, i) => Math.abs(Math.sin(i / 5) * 80 + Math.random() * 20)),
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCpuData((prev) => [...prev.slice(1), Math.floor(Math.random() * 60) + 10]);
            setMemData((prev) => [...prev.slice(1), Math.floor(Math.random() * 20) + 40]);
            setNetworkData((prev) => [...prev.slice(1), Math.abs(Math.sin(Date.now() / 2000) * 80 + Math.random() * 20)]);
        }, 500);
        return () => clearInterval(timer);
    }, []);

    return (
        <Box flexDirection="column" padding={1} gap={1}>
            <Text bold>Sparkline Demo</Text>
            <Text color="gray">{imageNote}</Text>

            <Box flexDirection="column" gap={1}>
                <Text bold dimColor>── Character Mode ──────────────────────────</Text>

                <Box>
                    <Text>CPU  </Text>
                    <Text color="yellow">{String(cpuData[cpuData.length - 1]).padStart(3)}% </Text>
                    <Sparkline data={cpuData} min={0} max={100} color="green" variant="block" mode="character" />
                </Box>
                <Box>
                    <Text>Mem  </Text>
                    <Text color="cyan">{String(memData[memData.length - 1]).padStart(3)}% </Text>
                    <Sparkline data={memData} min={0} max={100} color="blue" variant="braille" mode="character" />
                </Box>

                <Text bold dimColor>── Image Mode (auto-detect) ─────────────────</Text>

                <Box flexDirection="column">
                    <Text dimColor>Network throughput (30s, height=4)</Text>
                    <Sparkline
                        data={networkData}
                        min={0}
                        max={100}
                        mode="auto"
                        height={4}
                        width={30}
                        colors={['#0d7377', '#14a085', '#27ae60', '#f1c40f']}
                        cellPx={8}
                    />
                </Box>

                <Box flexDirection="column">
                    <Text dimColor>CPU (height=3, single color)</Text>
                    <Sparkline
                        data={cpuData}
                        min={0}
                        max={100}
                        mode="auto"
                        height={3}
                        color="#00bfa5"
                        cellPx={8}
                    />
                </Box>

                <Box flexDirection="column">
                    <Text dimColor>Inline (height=1, same width as char mode)</Text>
                    <Box>
                        <Text>Load </Text>
                        <Sparkline data={cpuData} min={0} max={100} mode="auto" height={1} color="green" />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

render(<App />);
