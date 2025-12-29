import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import { Table, type TableColumn } from '../../src/components/Table';

interface Data {
    id: number;
    name: string;
}

const columns: TableColumn<Data>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
];

const data = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];

describe('Table', () => {
    it('renders headers and data', () => {
        const { lastFrame } = render(<Table data={data} columns={columns} />);
        expect(lastFrame()).toMatch(/ID/);
        expect(lastFrame()).toMatch(/Name/);
        expect(lastFrame()).toMatch(/Alice/);
        expect(lastFrame()).toMatch(/Bob/);
    });

    it('triggers onSort callback', async () => {
        const onSort = vi.fn();
        const { stdin } = render(<Table data={data} columns={columns} onSort={onSort} />);

        // Initial render, first column should be auto-focused (from our implementation)
        // We simulate 'Enter' key press
        await new Promise((resolve) => setTimeout(resolve, 100));
        stdin.write('\r'); // Enter
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify callback
        expect(onSort).toHaveBeenCalled();
    });
});
