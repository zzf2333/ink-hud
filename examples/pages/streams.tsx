import { Box, Text } from 'ink';
import React, { useState } from 'react';
import {
    Grid,
    GridItem,
    LogStream,
    Panel,
    PulseBar,
    Table,
    ThemeProvider,
    type TableColumn,
    type TableProps,
} from 'ink-hud';
import { PROCESS_LIST, type Process, useLogStream, usePings } from '../shared/data';

const COLUMNS: TableColumn<Process>[] = [
    { header: 'PID',     accessor: 'pid',     align: 'right',  width: 6  },
    { header: 'NAME',    accessor: 'name',    align: 'left',   width: 12 },
    { header: 'CPU %',   accessor: (p) => `${p.cpu.toFixed(1)}%`, align: 'right', width: 7 },
    { header: 'MEM',     accessor: 'memory',  align: 'right',  width: 8  },
    { header: 'THREADS', accessor: 'threads', align: 'right',  width: 8  },
    {
        header: 'STATUS',
        accessor: (p) => (
            <Text color={p.status === 'Running' ? 'green' : 'yellow'}>{p.status}</Text>
        ),
        align: 'center',
        width: 8,
    },
];

export const StreamsPage = () => {
    const logs = useLogStream(60);
    const pings = usePings(40);

    const [tableData, setTableData] = useState(PROCESS_LIST);
    const [sortCol, setSortCol] = useState(0);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const handleSort: TableProps<Process>['onSort'] = (column, index) => {
        const newDir: 'asc' | 'desc' = sortCol === index && sortDir === 'asc' ? 'desc' : 'asc';
        setSortCol(index);
        setSortDir(newDir);

        const sorted = [...tableData].sort((a, b) => {
            let valA: number | string;
            let valB: number | string;
            if (column.header === 'CPU %') { valA = a.cpu; valB = b.cpu; }
            else if (column.header === 'THREADS') { valA = a.threads; valB = b.threads; }
            else if (column.header === 'STATUS') { valA = a.status; valB = b.status; }
            else if (column.header === 'PID') { valA = a.pid; valB = b.pid; }
            else if (column.header === 'NAME') { valA = a.name; valB = b.name; }
            else { valA = a.memory; valB = b.memory; }
            if (valA < valB) return newDir === 'asc' ? -1 : 1;
            if (valA > valB) return newDir === 'asc' ? 1 : -1;
            return 0;
        });
        setTableData(sorted);
    };

    return (
        <Box flexDirection="column" paddingX={1}>
            {/* Info bar */}
            <Box paddingX={1} marginBottom={1}>
                <Text bold color="cyanBright">
                    Data stream components — LogStream · PulseBar · Table
                </Text>
            </Box>

            <Grid columns={3} rowHeight={18} widthOffset={4}>
                {/* Left: logs + pulse stacked */}
                <GridItem span={2}>
                    <Box flexDirection="column" height={18}>
                        <Box height={12}>
                            <Panel title="System Logs" height={12} borderStyle="round">
                                <LogStream logs={logs} maxLines={60} />
                            </Panel>
                        </Box>
                        <Box height={6}>
                            <ThemeProvider>
                                <Panel title="Network Heartbeat — PulseBar" height={6} borderStyle="single">
                                    <PulseBar records={pings} maxBars={40} />
                                    <Text dimColor>
                                        {'  '}
                                        <Text color="green">■</Text>
                                        {' good  '}
                                        <Text color="yellow">■</Text>
                                        {' unstable  '}
                                        <Text color="red">■</Text>
                                        {' bad  '}
                                        <Text dimColor>■</Text>
                                        {' no data'}
                                    </Text>
                                </Panel>
                            </ThemeProvider>
                        </Box>
                    </Box>
                </GridItem>

                {/* Right: interactive table */}
                <GridItem>
                    <Panel
                        title="Process List — Tab / Enter to sort"
                        height={18}
                        borderStyle="round"
                    >
                        <Text dimColor>▾ Tab moves focus · Enter sorts column</Text>
                        <Table<Process>
                            data={tableData}
                            columns={COLUMNS}
                            sortColumn={sortCol}
                            sortDirection={sortDir}
                            zebra
                            onSort={handleSort}
                        />
                    </Panel>
                </GridItem>
            </Grid>
        </Box>
    );
};
