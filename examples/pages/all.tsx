import { Box, Text } from "ink";
import React from "react";
import {
	AreaChart,
	BarChart,
	BigNumber,
	Gauge,
	Grid,
	GridItem,
	Heatmap,
	LineChart,
	LogStream,
	Panel,
	PieChart,
	PulseBar,
	Sparkline,
	Table,
	type TableColumn,
	useTheme,
} from "ink-hud";
import {
	CHART_AREA_SERIES,
	CHART_BAR_SERIES,
	CHART_PIE_DATA,
	PROCESS_LIST,
	type Process,
	makeHeatmapMatrix,
	useLogStream,
	usePings,
	useSystemMetrics,
} from "../shared/data";

const HEATMAP_COLORS = ["#1e3a5f", "#1d6fa4", "#56b4d3", "#f0e442", "#e06c75"];
const HEATMAP_MATRIX = makeHeatmapMatrix();

const PROCESS_COLUMNS: TableColumn<Process>[] = [
	{ header: "PID", accessor: "pid", align: "right", width: 6 },
	{ header: "NAME", accessor: "name", align: "left", width: 12 },
	{
		header: "CPU",
		accessor: (p) => `${p.cpu.toFixed(1)}%`,
		align: "right",
		width: 6,
	},
	{ header: "MEM", accessor: "memory", align: "right", width: 8 },
	{
		header: "STATUS",
		accessor: (p) => (
			<Text color={p.status === "Running" ? "green" : "yellow"}>
				{p.status}
			</Text>
		),
		align: "center",
		width: 8,
	},
];

export const AllPage = () => {
	const m = useSystemMetrics();
	const logs = useLogStream(40);
	const pings = usePings(36);
	const theme = useTheme();

	const C = {
		accent: theme.palette[5], // cyan
		warn: theme.palette[2], // yellow
		purple: theme.palette[3], // purple
		success: theme.semantic.success,
		error: theme.semantic.error,
	};

	const errorColor = m.errorRate > 1 ? C.error : C.success;

	return (
		<Box flexDirection="column" paddingX={1}>
			{/* Banner */}
			<Box
				borderStyle="round"
				borderColor={C.accent}
				paddingX={2}
				marginBottom={1}
				justifyContent="space-between"
			>
				<Box flexDirection="column">
					<Text bold color={C.accent}>
						ink-hud — full component showcase
					</Text>
					<Text dimColor>
						BigNumber · Gauge · LineChart · AreaChart · BarChart ·
						PieChart · Sparkline · Heatmap · LogStream · PulseBar ·
						Table
					</Text>
				</Box>
				<Box flexDirection="column" alignItems="flex-end">
					<Text color={C.success}>● ONLINE</Text>
					<Text dimColor>{new Date().toLocaleTimeString()}</Text>
				</Box>
			</Box>

			{/* Row 1 — KPI BigNumbers */}
			<Grid columns={4} rowHeight={7} widthOffset={4}>
				<GridItem>
					<Panel title="Requests/s" borderColor={C.accent}>
						<BigNumber
							value={m.reqs.toLocaleString("en-US")}
							label="req/s"
							color={C.accent}
							trendDirection={m.reqsTrend >= 0 ? "up" : "down"}
							trendLabel={`${m.reqsTrend >= 0 ? "+" : ""}${m.reqsTrend}%`}
							align="center"
						/>
					</Panel>
				</GridItem>
				<GridItem>
					<Panel title="p99 Latency" borderColor={C.warn}>
						<BigNumber
							value={m.latency}
							suffix="ms"
							label="p99"
							color={C.warn}
							trendDirection={m.latencyTrend <= 0 ? "up" : "down"}
							trendLabel={`${m.latencyTrend >= 0 ? "+" : ""}${m.latencyTrend}%`}
							align="center"
						/>
					</Panel>
				</GridItem>
				<GridItem>
					<Panel title="Error Rate" borderColor={errorColor}>
						<BigNumber
							value={m.errorRate}
							suffix="%"
							label="errors"
							color={errorColor}
							trendDirection={m.errorTrend <= 0 ? "up" : "down"}
							trendLabel={`${m.errorTrend >= 0 ? "+" : ""}${m.errorTrend}`}
							align="center"
						/>
					</Panel>
				</GridItem>
				<GridItem>
					<Panel title="Active Users" borderColor={C.purple}>
						<BigNumber
							value={m.activeUsers.toLocaleString("en-US")}
							label="users"
							color={C.purple}
							trendDirection={m.usersTrend >= 0 ? "up" : "down"}
							trendLabel={`${m.usersTrend >= 0 ? "+" : ""}${m.usersTrend}%`}
							align="center"
						/>
					</Panel>
				</GridItem>
			</Grid>

			{/* Row 2 — LineChart + Gauges */}
			<Grid columns={5} rowHeight={14} widthOffset={4}>
				<GridItem span={4}>
					<Panel
						title="LineChart — Throughput (CPU/Memory/Network)"
						borderStyle="round"
					>
						<LineChart
							series={m.throughput}
							showLegend
							showAxis
							legendPosition="bottom"
						/>
					</Panel>
				</GridItem>
				<GridItem>
					<Box flexDirection="column" height={14}>
						<Box height={7}>
							<Panel
								title="Gauge — CPU"
								height={7}
								borderColor={C.success}
							>
								<Box
									flexDirection="column"
									alignItems="center"
									justifyContent="center"
								>
									<Gauge
										value={m.cpu}
										min={0}
										max={100}
										color={
											m.cpu > 80
												? C.error
												: m.cpu > 60
													? C.warn
													: C.success
										}
									/>
									<Text dimColor>
										{Math.round(m.cpu)} / 100
									</Text>
								</Box>
							</Panel>
						</Box>
						<Box height={7}>
							<Panel
								title="Gauge — Memory"
								height={7}
								borderColor={C.accent}
							>
								<Box
									flexDirection="column"
									alignItems="center"
									justifyContent="center"
								>
									<Gauge
										value={m.memory}
										min={0}
										max={100}
										color={
											m.memory > 85 ? C.error : C.accent
										}
										fillChar="⬢"
										emptyChar="·"
									/>
									<Text dimColor>
										{Math.round(m.memory)} / 100
									</Text>
								</Box>
							</Panel>
						</Box>
					</Box>
				</GridItem>
			</Grid>

			{/* Row 3 — AreaChart + BarChart + PieChart */}
			<Grid columns={3} rowHeight={18} widthOffset={4}>
				<GridItem>
					<Panel
						title="AreaChart — Traffic & Cached"
						borderStyle="round"
						borderColor={C.success}
					>
						<AreaChart
							series={CHART_AREA_SERIES}
							showLegend
							showAxis
							legendPosition="bottom"
						/>
					</Panel>
				</GridItem>
				<GridItem>
					<Panel
						title="BarChart — Read & Write"
						borderStyle="round"
						borderColor={C.warn}
					>
						<BarChart
							series={CHART_BAR_SERIES}
							showLegend
							orientation="vertical"
							legendPosition="bottom"
						/>
					</Panel>
				</GridItem>
				<GridItem>
					<Panel
						title="PieChart — Request breakdown"
						borderStyle="round"
						borderColor={C.purple}
					>
						<PieChart
							data={CHART_PIE_DATA}
							showLegend
							showLabels
							legendPosition="bottom"
						/>
					</Panel>
				</GridItem>
			</Grid>

			{/* Row 4a — Sparkline (3 variants) */}
			<Grid columns={3} rowHeight={4} widthOffset={4}>
				<GridItem>
					<Panel
						title="Sparkline — block"
						borderStyle="single"
						borderColor={C.accent}
					>
						<Sparkline
							data={m.sparkCpu}
							mode="character"
							variant="block"
							color={C.accent}
						/>
					</Panel>
				</GridItem>
				<GridItem>
					<Panel
						title="Sparkline — braille"
						borderStyle="single"
						borderColor={C.purple}
					>
						<Sparkline
							data={m.sparkMem}
							mode="character"
							variant="braille"
							color={C.purple}
						/>
					</Panel>
				</GridItem>
				<GridItem>
					<Panel
						title="Sparkline — auto + gradient"
						borderStyle="single"
						borderColor={C.warn}
					>
						<Sparkline
							data={m.sparkNet}
							mode="auto"
							color={C.warn}
							colors={[C.success, C.warn, C.error]}
						/>
					</Panel>
				</GridItem>
			</Grid>

			{/* Row 4b — Heatmap (7 days × 24 hours needs rowHeight=9 for 7 inner rows) */}
			<Grid columns={1} rowHeight={9} widthOffset={4}>
				<GridItem>
					<Panel
						title="Heatmap — Server Activity"
						borderStyle="single"
						borderColor={C.accent}
					>
						<Heatmap
							data={HEATMAP_MATRIX}
							mode="character"
							colors={HEATMAP_COLORS}
						/>
					</Panel>
				</GridItem>
			</Grid>

			{/* Row 5 — LogStream + PulseBar (left) | Table (right) */}
			<Grid columns={3} rowHeight={14} widthOffset={4}>
				<GridItem span={2}>
					<Box flexDirection="column" height={14}>
						<Box height={8}>
							<Panel
								title="LogStream — System Logs"
								height={8}
								borderStyle="round"
							>
								<LogStream logs={logs} maxLines={40} />
							</Panel>
						</Box>
						<Box height={6}>
							<Panel
								title="PulseBar — Network Heartbeat"
								height={6}
								borderStyle="single"
							>
								<PulseBar records={pings} maxBars={36} />
								<Text dimColor>
									{"  "}
									<Text color="green">■</Text>
									{" good  "}
									<Text color="yellow">■</Text>
									{" unstable  "}
									<Text color="red">■</Text>
									{" bad"}
								</Text>
							</Panel>
						</Box>
					</Box>
				</GridItem>
				<GridItem>
					<Panel
						title="Table — Process List"
						height={14}
						borderStyle="round"
					>
						<Table<Process>
							data={PROCESS_LIST}
							columns={PROCESS_COLUMNS}
							zebra
						/>
					</Panel>
				</GridItem>
			</Grid>
		</Box>
	);
};
