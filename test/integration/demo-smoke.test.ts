/**
 * Demo smoke test
 *
 * Spawns `tsx examples/dashboard.tsx` and verifies that it boots without
 * a JavaScript crash (TypeError, ReferenceError, SyntaxError).
 * Visual output correctness is covered separately by dashboard.test.tsx.
 */

import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const ROOT_DIR = join(import.meta.dirname, '..', '..');

async function killAndWait(child: ReturnType<typeof spawn>): Promise<void> {
    if (child.killed || child.exitCode !== null) return;
    child.kill('SIGTERM');
    await Promise.race([
        new Promise<void>((resolve) => child.once('exit', () => resolve())),
        new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ]);
    if (!child.killed && child.exitCode === null) {
        child.kill('SIGKILL');
        await new Promise<void>((resolve) => child.once('exit', () => resolve()));
    }
}

describe('demo smoke', () => {
    let child: ReturnType<typeof spawn> | null = null;

    afterEach(async () => {
        if (child) {
            await killAndWait(child);
            child = null;
        }
    });

    it(
        'boots without JavaScript errors',
        async () => {
            let stderr = '';

            child = spawn('node_modules/.bin/tsx', ['examples/dashboard.tsx'], {
                cwd: ROOT_DIR,
                env: { ...process.env, FORCE_COLOR: '0' },
                stdio: ['ignore', 'ignore', 'pipe'],
            });

            child.stderr?.on('data', (d: Buffer) => {
                stderr += d.toString();
            });

            // Let the process run for 1.5s to surface any startup crashes
            await new Promise<void>((resolve) => setTimeout(resolve, 1500));

            // Capture exit code before killing
            const exitedEarly = child.exitCode !== null;
            const earlyExitCode = child.exitCode;

            await killAndWait(child);
            child = null;

            // An early exit with a non-zero code (not SIGTERM=143) means a crash
            if (exitedEarly) {
                expect(earlyExitCode, `Process crashed with exit code ${earlyExitCode}:\n${stderr}`).toBe(0);
            }

            // No JavaScript runtime errors on stderr
            const jsErrors = stderr
                .split('\n')
                .filter((line) => /TypeError|ReferenceError|SyntaxError/.test(line));
            expect(jsErrors, `JavaScript errors in stderr:\n${jsErrors.join('\n')}`).toHaveLength(0);
        },
        8000,
    );
});
