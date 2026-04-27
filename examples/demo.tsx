import { Box, Text, render, useApp, useInput, useStdout } from 'ink';
import React, { useEffect, useState } from 'react';
import { InkHudProvider, ThemeProvider } from 'ink-hud';
import { ChartsPage } from './pages/charts';
import { ImagePage } from './pages/image';
import { LayoutPage } from './pages/layout';
import { OverviewPage } from './pages/overview';
import { StreamsPage } from './pages/streams';

// --- Page registry ---

const PAGES = [
    { label: 'Overview', component: OverviewPage },
    { label: 'Charts',   component: ChartsPage   },
    { label: 'Image',    component: ImagePage     },
    { label: 'Streams',  component: StreamsPage   },
    { label: 'Layout',   component: LayoutPage    },
] as const;

// --- Tab bar ---

const TabBar = ({ active }: { active: number }) => (
    <Box paddingX={1} paddingY={0}>
        {PAGES.map((page, i) => (
            <Box key={page.label} marginRight={1}>
                {i === active ? (
                    <Text inverse bold>{` [${i + 1}] ${page.label} `}</Text>
                ) : (
                    <Text dimColor>{` [${i + 1}] ${page.label} `}</Text>
                )}
            </Box>
        ))}
    </Box>
);

// --- Footer ---

const Footer = () => (
    <Box paddingX={2}>
        <Text dimColor>
            {'q '}
        </Text>
        <Text dimColor>quit  ·  </Text>
        <Text dimColor>{'← → '}</Text>
        <Text dimColor>or Tab navigate  ·  </Text>
        <Text dimColor>1-5 </Text>
        <Text dimColor>jump to page</Text>
    </Box>
);

// --- Terminal width hook (auto-resizes with window) ---

function useTerminalWidth(): number {
    const { stdout } = useStdout();
    const [width, setWidth] = useState(stdout?.columns ?? 120);

    useEffect(() => {
        if (!stdout) return;
        setWidth(stdout.columns);
        const onResize = () => setWidth(stdout.columns);
        stdout.on('resize', onResize);
        return () => { stdout.off('resize', onResize); };
    }, [stdout]);

    return width;
}

// --- Showcase root ---

export const Showcase = () => {
    const [active, setActive] = useState(0);
    const { exit } = useApp();
    const width = useTerminalWidth();

    useInput((input, key) => {
        if (input === 'q') return exit();
        const n = parseInt(input, 10);
        if (!isNaN(n) && n >= 1 && n <= PAGES.length) return setActive(n - 1);
        if (key.leftArrow || (key.tab && key.shift)) {
            return setActive((a) => (a + PAGES.length - 1) % PAGES.length);
        }
        if (key.rightArrow || key.tab) {
            return setActive((a) => (a + 1) % PAGES.length);
        }
    });

    const Page = PAGES[active].component;

    return (
        <Box flexDirection="column" width={width}>
            <TabBar active={active} />
            <Box borderStyle="single" borderColor="gray" paddingX={0}>
                <Page />
            </Box>
            <Footer />
        </Box>
    );
};

// --- Entry point ---

render(
    <InkHudProvider>
        <ThemeProvider>
            <Showcase />
        </ThemeProvider>
    </InkHudProvider>,
);
