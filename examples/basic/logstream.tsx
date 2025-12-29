import React, { useEffect, useState } from 'react';
import { render, Box } from 'ink';
import { LogStream } from '../../src/index.js';

const LogStreamDemo = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [, setCount] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCount(c => {
                const newCount = c + 1;
                const type = newCount % 10 === 0 ? 'Error' : newCount % 5 === 0 ? 'Warn' : 'Info';
                const msg = `[${new Date().toLocaleTimeString()}] [${type}] This is log message #${newCount} checking system status...`;

                setLogs(prev => {
                    const next = [...prev, msg];
                    // The component handles limiting, but we can also limit here to avoid huge state
                    if (next.length > 200) return next.slice(-200);
                    return next;
                });
                return newCount;
            });
        }, 200); // Add log every 200ms

        return () => clearInterval(timer);
    }, []);

    return (
        <Box flexDirection="column" padding={2}>
            <LogStream
                title="System Logs (Tail -f)"
                logs={logs}
                height={15} // Visual height
                width={60}
                maxLines={100} // Buffer limit
                borderStyle="round"
                borderColor="green"
            />
        </Box>
    );
};

render(<LogStreamDemo />);
