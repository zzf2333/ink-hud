import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ink-hud': path.resolve(__dirname, 'src/index.ts'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts', 'src/**/*.tsx'],
            exclude: [
                'node_modules/',
                'dist/',
                'test/',
                'examples/',
                '**/*.test.ts',
                '**/*.test.tsx',
            ],
        },
    },
});
