import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import { Table, type TableColumn, type TableProps } from '../../src/index.js';

interface Process {
    pid: number;
    name: string;
    cpu: number;
    memory: string;
    status: string;
}

const initialData: Process[] = [
    { pid: 1024, name: 'node', cpu: 12.5, memory: '150MB', status: 'Running' },
    { pid: 2048, name: 'postgres', cpu: 5.2, memory: '500MB', status: 'Running' },
    { pid: 3096, name: 'redis-server', cpu: 1.1, memory: '50MB', status: 'Running' },
    { pid: 4050, name: 'nginx_worker', cpu: 0.1, memory: '20MB', status: 'Sleep' },
    { pid: 5100, name: 'chrome_helper', cpu: 25.4, memory: '1.2GB', status: 'Running' },
    { pid: 6200, name: 'slack', cpu: 3.5, memory: '800MB', status: 'Running' },
    { pid: 7300, name: 'vscode', cpu: 10.1, memory: '900MB', status: 'Running' },
    { pid: 8400, name: 'docker', cpu: 8.8, memory: '2.5GB', status: 'Running' },
];

const columns: TableColumn<Process>[] = [
    { header: 'PID', accessor: 'pid', align: 'right' },
    { header: 'NAME', accessor: 'name', align: 'left' },
    { header: 'CPU %', accessor: (item) => `${item.cpu.toFixed(1)}%`, align: 'right' },
    { header: 'MEMORY', accessor: 'memory', align: 'right' },
    {
        header: 'STATUS', accessor: (item) => (
            <Text color={item.status === 'Running' ? 'green' : 'yellow'}>{item.status}</Text>
        ), align: 'center'
    },
];

const TableDemo = () => {
    const [data, setData] = useState(initialData);
    const [sortCol, setSortCol] = useState<number>(0);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const handleSort: TableProps<Process>['onSort'] = (column, index) => {
        let newDir: 'asc' | 'desc' = 'asc';
        if (sortCol === index) {
            newDir = sortDir === 'asc' ? 'desc' : 'asc';
        }
        setSortCol(index);
        setSortDir(newDir);

        const sorted = [...data].sort((a, b) => {
            let valA: any = a[column.accessor as keyof Process];
            let valB: any = b[column.accessor as keyof Process];

            // Manual overrides for function accessors for this demo
            if (column.header === 'CPU %') { valA = a.cpu; valB = b.cpu; }
            else if (column.header === 'STATUS') { valA = a.status; valB = b.status; }

            // Default accessor fallback if manual override didn't catch 
            // (Note: accessor key might be property name even if function accessor passed? 
            // No, accessor is either key OR function. table passes the object.)

            if (valA === undefined && typeof column.accessor === 'string') {
                valA = a[column.accessor as keyof Process];
                valB = b[column.accessor as keyof Process];
            }

            if (valA < valB) return newDir === 'asc' ? -1 : 1;
            if (valA > valB) return newDir === 'asc' ? 1 : -1;
            return 0;
        });
        setData(sorted);
    };

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">Process Table (Interactive)</Text>
            <Text dimColor>Press Tab to navigate headers, Enter to sort.</Text>
            <Box marginTop={1}>
                <Table
                    data={data}
                    columns={columns}
                    sortColumn={sortCol}
                    sortDirection={sortDir}
                    zebra={true}
                    onSort={handleSort}
                />
            </Box>
        </Box>
    );
};

render(<TableDemo />);
