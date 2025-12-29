import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useApp, render, useStdout } from 'ink';
import {
    BigNumber,
    Panel,
    LineChart,
    PieChart,
    BarChart,
    AreaChart,
    Gauge,
    Sparkline,
    Heatmap,
    LogStream,
    Table,
    Grid,
    GridItem,
    TableColumn
} from '../src/index';

// --- Types ---

interface Order {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: number;
    amount: number;
    status: 'OPEN' | 'FILLED' | 'PARTIAL';
    pnl?: number;
}

interface MarketData {
    price: number;
    timestamp: number;
}

// --- Data Simulation Hook ---

const SYMBOLS = ['BTC-USD', 'ETH-USD'];
const INITIAL_BTC = 46500;
const INITIAL_ETH = 3200;

function useTradingSystem() {
    // 1. Market Data (Price History)
    const [btcHistory, setBtcHistory] = useState<number[]>(Array(60).fill(INITIAL_BTC));
    const [ethHistory, setEthHistory] = useState<number[]>(Array(60).fill(INITIAL_ETH));

    // 2. Order Book Depth (Bid/Ask volume at different price levels) - Simplified for Area Chart
    const [marketDepth, setMarketDepth] = useState<number[]>([]);

    // 3. Active Positions / Orders
    const [orders, setOrders] = useState<Order[]>([]);

    // 4. System Metrics
    const [cpuLoad, setCpuLoad] = useState(35);
    const [memoryLoad, setMemoryLoad] = useState(42);
    const [latency, setLatency] = useState<number[]>(Array(20).fill(15));
    const [serverHeatmap, setServerHeatmap] = useState<number[][]>([]);

    // 5. KPIs
    const [netPnl, setNetPnl] = useState(2540.50);
    const [openExposure, setOpenExposure] = useState(125000); // In USD
    const [dailyVolume, setDailyVolume] = useState(4500000);

    // 6. Logs
    const [logs, setLogs] = useState<string[]>([]);

    // 7. Volatility / Volume Profile
    const [volumeProfile, setVolumeProfile] = useState<number[]>([]);

    // Simulation Loop
    useEffect(() => {
        // Init mock data
        setMarketDepth(Array.from({ length: 40 }, () => 20 + Math.random() * 50));
        setServerHeatmap(Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => Math.random())));
        setVolumeProfile(Array.from({ length: 12 }, () => 100 + Math.random() * 200));

        // Initial orders
        const initialOrders: Order[] = [
            { id: 'ORD-1023', symbol: 'BTC-USD', side: 'BUY', price: INITIAL_BTC - 50, amount: 0.5, status: 'OPEN' },
            { id: 'ORD-1024', symbol: 'ETH-USD', side: 'SELL', price: INITIAL_ETH + 10, amount: 5.0, status: 'PARTIAL', pnl: 120 },
            { id: 'ORD-1025', symbol: 'BTC-USD', side: 'SELL', price: INITIAL_BTC + 120, amount: 0.2, status: 'OPEN' },
        ];
        setOrders(initialOrders);

        const interval = setInterval(() => {
            // Update Prices (Random Walk)
            setBtcHistory(prev => {
                const last = prev[prev.length - 1] || INITIAL_BTC;
                const change = (Math.random() - 0.48) * 150; // Slight upward bias
                const next = last + change;
                return [...prev.slice(1), next];
            });
            setEthHistory(prev => {
                const last = prev[prev.length - 1] || INITIAL_ETH;
                const change = (Math.random() - 0.48) * 15;
                const next = last + change;
                return [...prev.slice(1), next];
            });

            // Update Metrics
            setNetPnl(p => p + (Math.random() - 0.4) * 20);
            setDailyVolume(v => v + Math.random() * 5000);
            setCpuLoad(c => Math.max(10, Math.min(95, c + (Math.random() - 0.5) * 10)));
            setMemoryLoad(m => Math.max(20, Math.min(80, m + (Math.random() - 0.5) * 2)));

            // Latency Spikes
            setLatency(prev => {
                const base = 15;
                const spike = Math.random() > 0.9 ? Math.random() * 100 : Math.random() * 5;
                return [...prev.slice(1), base + spike];
            });

            // Update Heatmap (Server Cores Load)
            setServerHeatmap(prev => prev.map(row =>
                row.map(val => Math.max(0, Math.min(1, val + (Math.random() - 0.5) * 0.3)))
            ));

            // Random Log
            if (Math.random() > 0.7) {
                const sources = ['Algo-1', 'RiskManager', 'Connector', 'Strategy-A'];
                const msgs = ['Order filled partially', 'Latency spike detected', 'Rebalancing portfolio', 'New tick received', 'Spread updated'];
                const types = ['INFO', 'INFO', 'WARN', 'SUCCESS'];
                const type = types[Math.floor(Math.random() * types.length)];
                const msg = `[${new Date().toISOString().split('T')[1]?.slice(0, 8)}] [${type}] ${sources[Math.floor(Math.random() * sources.length)]}: ${msgs[Math.floor(Math.random() * msgs.length)]}`;
                setLogs(prev => [...prev.slice(-19), msg]);
            }

            // Randomly update orders pnl
            setOrders(prev => prev.map(o => ({
                ...o,
                pnl: o.pnl !== undefined ? o.pnl + (Math.random() - 0.5) * 5 : undefined,
                status: Math.random() > 0.95 ? (o.status === 'OPEN' ? 'PARTIAL' : 'FILLED') : o.status
            })).filter(o => o.status !== 'FILLED')); // Remove filled orders periodically (simulated)

            // Add new order occasionally
            if (Math.random() > 0.92 && orders.length < 8) {
                const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
                const curPrice = btcHistory[btcHistory.length - 1] || 40000;
                setOrders(prev => [...prev, {
                    id: `ORD-${Math.floor(Math.random() * 10000)}`,
                    symbol: Math.random() > 0.5 ? 'BTC-USD' : 'ETH-USD',
                    side,
                    price: Math.floor(curPrice + (Math.random() - 0.5) * 500),
                    amount: Number(Math.random().toFixed(2)),
                    status: 'OPEN'
                }]);
            }

        }, 200);

        return () => clearInterval(interval);
    }, []);

    return {
        btcHistory,
        ethHistory,
        marketDepth,
        orders,
        cpuLoad,
        memoryLoad,
        latency,
        serverHeatmap,
        netPnl,
        openExposure,
        dailyVolume,
        logs,
        volumeProfile
    };
}

// --- Dashboard Component ---

export const HftDashboard = () => {
    const data = useTradingSystem();
    const { exit } = useApp();
    const { stdout } = useStdout();
    const [width, setWidth] = useState(100);

    // Auto-resize
    useEffect(() => {
        if (stdout) {
            setWidth(stdout.columns);
            const onResize = () => setWidth(stdout.columns);
            stdout.on('resize', onResize);
            return () => { stdout.off('resize', onResize); };
        }
    }, [stdout]);

    useInput((input) => {
        if (input === 'q') exit();
    });

    const isProfit = data.netPnl >= 0;

    return (
        <Box flexDirection="column" paddingX={2} paddingY={1} width={width}>
            {/* 1. Header Row */}
            <Box flexDirection="row" justifyContent="space-between" marginBottom={1} borderStyle="double" borderColor="blue" paddingX={2}>
                <Box flexDirection="column">
                    <Text bold color="blueBright">QUANT-OS v9.2.1</Text>
                    <Text color="gray">HFT ALGO MONITORING NODE</Text>
                </Box>
                <Box flexDirection="column" alignItems="flex-end">
                    <Text color="green">● SYSTEM ONLINE</Text>
                    <Text>{new Date().toLocaleTimeString()}</Text>
                </Box>
            </Box>

            {/* 2. KPI Grid (Top) */}
            <Grid columns={4} width={width - 4} rowHeight={7}>
                <GridItem>
                    <Panel title="NET PNL (24h)" borderColor={isProfit ? 'green' : 'red'}>
                        <BigNumber
                            value={Math.floor(data.netPnl)}
                            label="USD"
                            color={isProfit ? 'green' : 'red'}
                            align='center'
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="EXPOSURE" borderColor="cyan">
                        <BigNumber
                            value={Math.floor(data.openExposure / 1000)}
                            label="k USD"
                            color="cyan"
                            align='center'
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="VOLUME (24h)" borderColor="yellow">
                        <BigNumber
                            value={Math.floor(data.dailyVolume / 1000000)}
                            label="M USD"
                            color="yellow"
                            align='center'
                        />
                    </Panel>
                </GridItem>
                <GridItem>
                    <Panel title="RISK INDEX" borderColor="magenta">
                        <Box flexDirection="column" alignItems="center" justifyContent="center">
                            <Gauge
                                value={data.cpuLoad}
                                label="Risk"
                                color={data.cpuLoad > 80 ? 'red' : 'green'}
                                width={15}
                            />
                            <Box marginTop={1}>
                                <Text color="gray">Mem: {Math.floor(data.memoryLoad)}%</Text>
                            </Box>
                        </Box>
                    </Panel>
                </GridItem>
            </Grid>

            {/* 3. Charts Area (Middle) */}
            <Box marginTop={1}>
                <Grid columns={3} width={width - 4} rowHeight={15}>
                    {/* Main Price Chart (spanning 2 columns) */}
                    <GridItem span={2}>
                        <Panel title="BTC-USD / ETH-USD Correlation" borderStyle="round">
                            <LineChart
                                series={[
                                    { name: 'BTC', data: data.btcHistory, color: 'blue' },
                                    { name: 'ETH', data: data.ethHistory.map(v => v * 14.5), color: 'magenta' } // Scale ETH to BTC range for visually comparable lines
                                ]}
                                showXAxis={false}
                                showYAxis={true}
                                showLegend={true}
                            />
                        </Panel>
                    </GridItem>
                    {/* Side Metrics */}
                    <GridItem>
                        <Box flexDirection="column" height={15}>
                            <Box height={7}>
                                <Panel title="Latency" height={7}>
                                    <Sparkline
                                        data={data.latency}
                                        color={data.latency[data.latency.length - 1]! > 50 ? 'red' : 'green'}
                                    /><Text color="gray" dimColor>Avg: {Math.floor(data.latency.reduce((a, b) => a + b, 0) / data.latency.length)}ms</Text>
                                </Panel>
                            </Box>
                            <Box height={8}>
                                <Panel title="Market Depth" height={8}>
                                    <AreaChart
                                        series={[{ name: 'Depth', data: data.marketDepth, color: 'cyan' }]}
                                        showAxis={false}
                                        showLegend={false}
                                    />
                                </Panel>
                            </Box>
                        </Box>
                    </GridItem>
                </Grid>
            </Box>

            {/* 4. Details Area (Bottom) */}
            <Box marginTop={1}>
                <Grid columns={5} width={width - 4} rowHeight={14}>
                    {/* Active Orders Table */}
                    <GridItem span={3}>
                        <Panel title="Live Orders">
                            <Table<Order>
                                data={data.orders.slice(0, 8)}
                                columns={[
                                    { header: 'ID', accessor: 'id', width: 10 },
                                    { header: 'Symbol', accessor: 'symbol', width: 10 },
                                    {
                                        header: 'Side',
                                        accessor: (item) => <Text color={item.side === 'BUY' ? 'green' : 'red'}>{item.side}</Text>,
                                        width: 6
                                    },
                                    { header: 'Price', accessor: (item) => item.price.toFixed(1), width: 10, align: 'right' },
                                    { header: 'Amt', accessor: (item) => item.amount.toFixed(2), width: 8, align: 'right' },
                                    { header: 'Status', accessor: 'status', width: 8 },
                                ]}
                            />
                        </Panel>
                    </GridItem>

                    {/* System Cluster Heatmap + Logs */}
                    <GridItem span={2}>
                        <Box flexDirection="column" height={14}>
                            <Box height={6} marginBottom={0}>
                                <Panel title="Cluster CPU" height={6} borderStyle="single">
                                    <Box justifyContent='center'>
                                        <Heatmap
                                            data={data.serverHeatmap}
                                            variant="unicode"
                                        />
                                    </Box>
                                </Panel>
                            </Box>
                            <Box flexGrow={1}>
                                <Panel title="System Logs" height={8} borderStyle="single">
                                    <LogStream logs={data.logs} maxLines={100} />
                                </Panel>
                            </Box>
                        </Box>
                    </GridItem>
                </Grid>
            </Box>

            <Box marginTop={0}>
                <Text color="gray" dimColor>Press 'q' to shutdown node.</Text>
            </Box>
        </Box>
    );
};

render(<HftDashboard />);
