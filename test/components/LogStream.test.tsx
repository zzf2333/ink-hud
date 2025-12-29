import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { LogStream } from '../../src/components/LogStream';

describe('LogStream', () => {
    it('renders logs', () => {
        const logs = ['System started', '[Info] Connection established'];
        const { lastFrame } = render(<LogStream logs={logs} />);
        expect(lastFrame()).toMatch(/System started/);
        expect(lastFrame()).toMatch(/Connection established/);
    });

    it('handles highlighting', () => {
        const logs = ['[Error] Failed to connect'];
        const { lastFrame } = render(<LogStream logs={logs} />);
        expect(lastFrame()).toMatch(/Error/i);
    });
});
