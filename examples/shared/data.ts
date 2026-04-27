import { useState, useEffect } from 'react';
import type { PingRecord, PieChartDataItem } from 'ink-hud';

// --- Helpers ---

function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}
function jitter(v: number, range: number) {
    return v + (Math.random() - 0.5) * range;
}

// --- Types ---

export interface SystemMetrics {
    reqs: number;
    reqsTrend: number;
    latency: number;
    latencyTrend: number;
    errorRate: number;
    errorTrend: number;
    activeUsers: number;
    usersTrend: number;
    cpu: number;
    memory: number;
    throughput: Array<{ name: string; data: number[]; color: string }>;
    sparkCpu: number[];
    sparkMem: number[];
    sparkNet: number[];
}

export interface Process {
    pid: number;
    name: string;
    cpu: number;
    memory: string;
    threads: number;
    status: string;
}

// --- System Metrics Hook ---

export function useSystemMetrics(): SystemMetrics {
    const [state, setState] = useState<SystemMetrics>({
        reqs: 9450,
        reqsTrend: 3.2,
        latency: 45,
        latencyTrend: -8.1,
        errorRate: 0.12,
        errorTrend: 0.02,
        activeUsers: 1842,
        usersTrend: 5.4,
        cpu: 62,
        memory: 71,
        throughput: [
            { name: 'CPU', data: Array(30).fill(62), color: '#61afef' },
            { name: 'Memory', data: Array(30).fill(71), color: '#c678dd' },
            { name: 'Network', data: Array(30).fill(35), color: '#98c379' },
        ],
        sparkCpu: Array(20).fill(62),
        sparkMem: Array(20).fill(71),
        sparkNet: Array(20).fill(35),
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setState((prev) => {
                const cpu = clamp(jitter(prev.cpu, 12), 5, 98);
                const memory = clamp(jitter(prev.memory, 5), 30, 95);
                const net = clamp(jitter(prev.sparkNet[prev.sparkNet.length - 1] ?? 35, 20), 5, 90);
                return {
                    reqs: Math.max(100, Math.round(jitter(prev.reqs, 500))),
                    reqsTrend: Number(jitter(prev.reqsTrend, 1).toFixed(1)),
                    latency: Math.max(1, Math.round(jitter(prev.latency, 10))),
                    latencyTrend: Number(jitter(prev.latencyTrend, 2).toFixed(1)),
                    errorRate: Math.max(0, Number(jitter(prev.errorRate, 0.05).toFixed(2))),
                    errorTrend: Number(jitter(prev.errorTrend, 0.01).toFixed(2)),
                    activeUsers: Math.max(0, Math.round(jitter(prev.activeUsers, 50))),
                    usersTrend: Number(jitter(prev.usersTrend, 0.5).toFixed(1)),
                    cpu,
                    memory,
                    throughput: prev.throughput.map((s, i) => ({
                        ...s,
                        data: [...s.data.slice(1), i === 0 ? cpu : i === 1 ? memory : net],
                    })),
                    sparkCpu: [...prev.sparkCpu.slice(1), cpu],
                    sparkMem: [...prev.sparkMem.slice(1), memory],
                    sparkNet: [...prev.sparkNet.slice(1), net],
                };
            });
        }, 500);
        return () => clearInterval(timer);
    }, []);

    return state;
}

// --- Log Stream Hook ---

const LOG_SOURCES = ['api-gateway', 'auth-service', 'db-proxy', 'cache-redis', 'worker-queue'];
const LOG_MESSAGES: Record<string, string[]> = {
    INFO:    ['Request processed in 12ms', 'Health check OK', 'Cache hit rate: 94%', 'Scheduled task started', 'Config reloaded'],
    WARN:    ['Slow query detected (>200ms)', 'Memory usage at 85%', 'Retry attempt 2/3', 'Connection pool at 90%'],
    ERROR:   ['Connection refused: db-replica', 'Timeout after 30s', 'Rate limit exceeded'],
    SUCCESS: ['Deployment complete v2.4.1', 'Backup verified', 'Migration applied'],
};
const LOG_LEVELS = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR', 'SUCCESS'] as const;

export function useLogStream(maxLines = 80): string[] {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (Math.random() < 0.7) {
                const level = LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)]!;
                const source = LOG_SOURCES[Math.floor(Math.random() * LOG_SOURCES.length)]!;
                const msgs = LOG_MESSAGES[level]!;
                const msg = msgs[Math.floor(Math.random() * msgs.length)]!;
                const ts = new Date().toISOString().split('T')[1]?.slice(0, 8) ?? '';
                setLogs((prev) => [...prev.slice(-(maxLines - 1)), `[${ts}] [${level}] ${source}: ${msg}`]);
            }
        }, 200);
        return () => clearInterval(timer);
    }, [maxLines]);

    return logs;
}

// --- Ping Records Hook ---

export function usePings(maxBars = 40): PingRecord[] {
    const [pings, setPings] = useState<PingRecord[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            const rand = Math.random();
            const status: PingRecord['status'] = rand < 0.75 ? 'good' : rand < 0.92 ? 'unstable' : 'bad';
            setPings((prev) => [...prev.slice(-(maxBars - 1)), { status }]);
        }, 300);
        return () => clearInterval(timer);
    }, [maxBars]);

    return pings;
}

// --- Heatmap Data (static, generated once) ---

export function makeHeatmapMatrix(): number[][] {
    return Array.from({ length: 7 }, (_, day) =>
        Array.from({ length: 24 }, (_, hour) => {
            let val = Math.random() * 15;
            if (day < 5 && hour >= 9 && hour <= 17) {
                val += Math.random() * 85;
            }
            return Math.floor(val);
        }),
    );
}

// --- Static Process List ---

export const PROCESS_LIST: Process[] = [
    { pid: 1024, name: 'node',       cpu: 12.5, memory: '150 MB', threads: 12, status: 'Running' },
    { pid: 2048, name: 'postgres',   cpu:  5.2, memory: '500 MB', threads:  8, status: 'Running' },
    { pid: 3096, name: 'redis',      cpu:  1.1, memory:  '50 MB', threads:  4, status: 'Running' },
    { pid: 4050, name: 'nginx',      cpu:  0.3, memory:  '20 MB', threads:  4, status: 'Running' },
    { pid: 5100, name: 'vite',       cpu: 25.4, memory: '1.2 GB', threads: 16, status: 'Running' },
    { pid: 6200, name: 'typescript', cpu:  3.5, memory: '800 MB', threads:  6, status: 'Running' },
    { pid: 7300, name: 'esbuild',    cpu:  8.1, memory: '200 MB', threads:  8, status: 'Sleep'   },
    { pid: 8400, name: 'docker',     cpu:  8.8, memory: '2.5 GB', threads: 20, status: 'Running' },
    { pid: 9500, name: 'vitest',     cpu: 15.0, memory: '400 MB', threads: 10, status: 'Running' },
    { pid: 1050, name: 'ink',        cpu:  2.1, memory:  '80 MB', threads:  2, status: 'Running' },
];

// --- Static Chart Fixtures (Charts page) ---

export const CHART_LINE_SERIES = [
    { name: 'Requests', data: [45, 62, 58, 70, 65, 80, 72, 85, 78, 90, 88, 95], color: '#61afef' },
    { name: 'Errors',   data: [2,  3,  1,  4,  2,  5,  3,  2,  4,  1,  3,  2],  color: '#e06c75' },
];

export const CHART_AREA_SERIES = [
    { name: 'Traffic', data: [10, 25, 20, 40, 35, 60, 55, 80, 70, 90, 85, 100], color: '#98c379' },
    { name: 'Cached',  data: [5,  12, 18, 30, 25, 40, 45, 60, 55, 65, 70,  80], color: '#61afef' },
];

export const CHART_BAR_SERIES = [
    { name: 'Read', data:  [30, 65, 45, 80, 55, 70, 40, 85], color: '#e5c07b' },
    { name: 'Write', data: [15, 30, 25, 50, 35, 45, 20, 60], color: '#c678dd' },
];

export const CHART_PIE_DATA: PieChartDataItem[] = [
    { name: 'API',    value: 45, color: '#61afef' },
    { name: 'DB',     value: 25, color: '#c678dd' },
    { name: 'Cache',  value: 20, color: '#98c379' },
    { name: 'Static', value: 10, color: '#e5c07b' },
];

export const CHART_HBAR_SERIES = [
    { name: 'Services', data: [72, 45, 88, 31, 60, 94, 52], color: '#56b6c2' },
];
