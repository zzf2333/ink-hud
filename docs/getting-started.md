# Getting Started

Learn how to use ink-hud to build beautiful terminal dashboards.

## Installation

```bash
npm install ink-hud ink react
# or
pnpm add ink-hud ink react
```

## Your First Chart

Create a file `app.tsx`:

```tsx
import React from 'react';
import { render } from 'ink';
import { LineChart } from 'ink-hud';

const App = () => {
    const data = [
        { name: 'CPU', data: [12, 15, 45, 32, 60, 75, 20, 10], color: 'cyan' },
        { name: 'Memory', data: [40, 42, 45, 48, 40, 38, 42, 45], color: 'magenta' },
    ];

    return <LineChart series={data} width={60} height={15} showLegend={true} />;
};

render(<App />);
```

Run it:

```bash
npx tsx app.tsx
```

![LineChart](./images/linechart.png)

## Building a Dashboard

Combine multiple components with Grid and Panel:

```tsx
import React from 'react';
import { render } from 'ink';
import { Grid, GridItem, Panel, BigNumber, LineChart, Gauge, LogStream } from 'ink-hud';

const Dashboard = () => {
    return (
        <Grid columns={3} width={120} rowHeight={12}>
            {/* KPI Cards */}
            <GridItem>
                <Panel title="Revenue" borderColor="green">
                    <BigNumber value={125000} label="USD" trend={12.5} color="green" />
                </Panel>
            </GridItem>
            <GridItem>
                <Panel title="Users" borderColor="cyan">
                    <BigNumber value={8432} label="Active" trend={-2.1} color="cyan" />
                </Panel>
            </GridItem>
            <GridItem>
                <Panel title="CPU Load">
                    <Gauge value={75} label="%" color="yellow" />
                </Panel>
            </GridItem>

            {/* Charts */}
            <GridItem span={2}>
                <Panel title="Traffic">
                    <LineChart 
                        series={[
                            { name: 'Requests', data: [100, 120, 140, 130, 150, 180], color: 'cyan' },
                            { name: 'Errors', data: [2, 3, 1, 4, 2, 5], color: 'red' },
                        ]}
                        height={8}
                    />
                </Panel>
            </GridItem>
            <GridItem>
                <Panel title="Logs">
                    <LogStream 
                        logs={[
                            '[INFO] Server started',
                            '[WARN] High memory',
                            '[INFO] Request processed',
                        ]}
                        maxLines={5}
                    />
                </Panel>
            </GridItem>
        </Grid>
    );
};

render(<Dashboard />);
```

![Dashboard](./images/dashboard.png)

## Real-Time Updates

Use React state for live updates:

```tsx
import React, { useState, useEffect } from 'react';
import { render } from 'ink';
import { LineChart, useSmooth } from 'ink-hud';

const App = () => {
    const [data, setData] = useState([10, 20, 15, 25, 30]);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => [...prev.slice(1), Math.random() * 100]);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <LineChart 
            series={[{ name: 'Live', data, color: 'cyan' }]} 
            width={40} 
            height={10}
        />
    );
};

render(<App />);
```

## Terminal Compatibility

ink-hud auto-detects your terminal and selects the best renderer:

| Terminal | Renderer | Quality |
|----------|----------|---------|
| iTerm2, Warp, VS Code | Braille | ⭐⭐⭐ Best |
| Terminal.app | Block | ⭐⭐ Good |
| Legacy/SSH | ASCII | ⭐ Basic |

Force a specific renderer:

```tsx
<LineChart series={data} renderer="braille" />
<LineChart series={data} renderer="block" />
<LineChart series={data} renderer="ascii" />
```

## Next Steps

- Browse [Component Guide](./components.md) for all available components
- Check [API Reference](./api.md) for complete props documentation
- Explore [examples/](../examples/) for working demos
