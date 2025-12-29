import { Box, Text, render } from "ink";
import React from "react";
import { Grid, GridItem } from '../../src/components/Grid';
import { AreaChart } from '../../src/components/AreaChart';
import { BarChart } from '../../src/components/BarChart';
import { PieChart } from '../../src/components/PieChart';
import { LineChart } from '../../src/components/LineChart';
import { Sparkline } from '../../src/components/Sparkline';

const App = () => {
	// --- Mock Data ---

	// AreaChart: Network Traffic
	const networkData = [
		{ name: 'Inbound', data: [10, 15, 12, 20, 25, 30, 28, 35, 40, 45, 42, 50, 55, 60, 58], color: 'cyan' },
		{ name: 'Outbound', data: [5, 8, 10, 15, 12, 20, 25, 22, 28, 30, 28, 35, 40, 38, 35], color: 'magenta' },
	];

	// PieChart: Storage (Short names)
	const storageData = [
		{ name: 'Sys', value: 40, color: 'red' },
		{ name: 'App', value: 25, color: 'blue' },
		{ name: 'Log', value: 15, color: 'yellow' },
		{ name: 'Free', value: 20, color: 'green' },
	];

	// LineChart: CPU Data
	const cpuData = [
		{ name: 'User', data: [40, 45, 50, 48, 55, 60, 65, 60, 55, 50, 45, 40, 35, 30, 25], color: 'green' },
		{ name: 'System', data: [20, 22, 25, 23, 28, 30, 35, 30, 28, 25, 20, 15, 10, 8, 5], color: 'yellow' },
	];

	// BarChart: Revenue (Single Series, Multi-Color)
	// Note: BarChart renders series. To have colorful bars for 1 series, we pass `colors`.
	// But BarChart usually colors by Series. 
	// Trick: 4 Series, 1 data point each.
	const revenueData = [
		{ name: 'Q1', data: [30], color: 'blue' },
		{ name: 'Q2', data: [45], color: 'cyan' },
		{ name: 'Q3', data: [55], color: 'magenta' },
		{ name: 'Q4', data: [70], color: 'green' },
	];

	// Sparkline Data
	const slCpu = [10, 20, 30, 40, 50, 60, 50];
	const slMem = [50, 52, 53, 55, 54, 56];
	const slNet = [80, 40, 20, 60, 90];

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold color="cyan">
				⚡ INK-HUD V2 ⚡
			</Text>

			<Box marginTop={1} borderStyle="round" borderColor="gray">
				<Grid columns={3} gap={1} widthOffset={4} rowHeight={15}>

					{/* --- ROW 1 --- */}

					{/* AreaChart: Span 2 */}
					<GridItem span={2}>
						<Box
							flexGrow={1}
							flexDirection="column"
							borderStyle="single"
							borderColor="cyan"
							paddingX={1}
						>
							<Text bold color="cyan">Net IO</Text>
							<AreaChart
								series={networkData}
								showLegend={true}
								legendPosition="top"
								showAxis={true}
								showXAxis={false}
								yTickFormat={(v: number) => `${v}MB`}
								yIntegerScale={true}
								widthOffset={4}
								heightOffset={3}
							/>
						</Box>
					</GridItem>

					{/* PieChart: Span 1 */}
					<GridItem span={1}>
						<Box
							flexGrow={1}
							flexDirection="column"
							borderStyle="single"
							borderColor="red"
							paddingX={1}
						>
							<Text bold color="red">Disk</Text>
							<PieChart
								data={storageData}
								showLegend={true}
								legendPosition="bottom"
								heightOffset={3}
								widthOffset={4}
							/>
						</Box>
					</GridItem>

					{/* --- ROW 2 --- */}

					{/* LineChart: Span 2 */}
					<GridItem span={2}>
						<Box
							flexGrow={1}
							flexDirection="column"
							borderStyle="single"
							borderColor="green"
							paddingX={1}
						>
							<Text bold color="green">CPU Load</Text>
							<LineChart
								series={cpuData}
								showLegend={true}
								legendPosition="bottom"
								showAxis={true}
								yTickFormat={(v: number) => `${v}%`}
								yIntegerScale={true}
								xIntegerScale={true}
								heightOffset={3}
								widthOffset={4}
							/>
						</Box>
					</GridItem>

					{/* Sparklines: Span 1 */}
					<GridItem span={1}>
						<Box
							flexGrow={1}
							flexDirection="column"
							borderStyle="single"
							borderColor="yellow"
							paddingX={1}
						>
							<Text bold color="yellow">Live</Text>

							<Box flexDirection="column" justifyContent="space-around" flexGrow={1}>
								<Box flexDirection="column">
									<Box justifyContent="space-between">
										<Text>CPU</Text>
										<Text color="red">45%</Text>
									</Box>
									<Sparkline data={slCpu} color="red" />
								</Box>

								<Box flexDirection="column">
									<Box justifyContent="space-between">
										<Text>Mem</Text>
										<Text color="blue">2G</Text>
									</Box>
									<Sparkline data={slMem} color="blue" />
								</Box>

								<Box flexDirection="column">
									<Box justifyContent="space-between">
										<Text>Net</Text>
										<Text color="green">1k</Text>
									</Box>
									<Sparkline data={slNet} color="green" />
								</Box>
							</Box>
						</Box>
					</GridItem>

					{/* --- ROW 3 --- */}

					{/* BarChart: Span 3 (Full Width) */}
					<GridItem span={3}>
						<Box
							flexGrow={1}
							flexDirection="column"
							borderStyle="single"
							borderColor="magenta"
							paddingX={1}
						>
							<Text bold color="magenta">Revenue Growth</Text>
							<BarChart
								series={revenueData}
								showLegend={true}
								legendPosition="top"
								showXAxis={true}
								yTickFormat={(v: number) => `$${v}k`}
								yIntegerScale={true}
								widthOffset={4}
								heightOffset={3}
							/>
						</Box>
					</GridItem>

				</Grid>
			</Box>
		</Box>
	);
};

render(<App />);
