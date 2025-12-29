/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { Axis } from '../../../src/components/common/Axis';

function stripAnsi(input: string): string {
    let output = '';
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (char === '\u001b' && input[i + 1] === '[') {
            i += 2;
            while (i < input.length && input[i] !== 'm') {
                i++;
            }
            i++;
            continue;
        }
        output += char ?? '';
        i++;
    }
    return output;
}

describe('Axis', () => {
    describe('X Axis', () => {
        it('should render tick labels', () => {
            const { lastFrame } = render(
                <Axis type="x" min={0} max={100} length={50} />
            );
            const output = stripAnsi(lastFrame() ?? '');
            expect(output).toContain('0');
            expect(output).toContain('100');
        });

        it('should render axis labels', () => {
            const { lastFrame } = render(
                <Axis type="x" min={0} max={100} length={50} label="Time" />
            );
            const output = stripAnsi(lastFrame() ?? '');
            expect(output).toContain('Time');
        });

        it('should not render ticks when tickCount is 0', () => {
            const { lastFrame } = render(
                <Axis type="x" min={0} max={100} length={50} tickCount={0} />
            );
            const output = stripAnsi(lastFrame() ?? '');
            expect(output.trim()).toBe('');
        });

        it('should only show one tick when min === max', () => {
            const { lastFrame } = render(
                <Axis type="x" min={50} max={50} length={30} />
            );
            const output = stripAnsi(lastFrame() ?? '');
            expect(output).toContain('50');
        });

        it('should support custom tickFormat', () => {
            const { lastFrame } = render(
                <Axis
                    type="x"
                    min={0}
                    max={100}
                    length={50}
                    tickFormat={(v) => `${v}%`}
                />
            );
            const output = stripAnsi(lastFrame() ?? '');
            expect(output).toContain('0%');
            expect(output).toContain('100%');
        });

        it('should force integer ticks when integerScale is true', () => {
            const { lastFrame } = render(
                <Axis
                    type="x"
                    min={0}
                    max={3}
                    length={30}
                    tickCount={5}
                    integerScale={true}
                />
            );
            const output = stripAnsi(lastFrame() ?? '');
            // integer ticks should not contain decimal points
            expect(output).not.toContain('.');
        });
    });

    describe('Y Axis', () => {
        it('should render tick labels', () => {
            const { lastFrame } = render(
                <Axis type="y" min={0} max={100} length={10} />
            );
            const output = stripAnsi(lastFrame() ?? '');
            expect(output).toContain('0');
            expect(output).toContain('100');
        });

        it('should arrange ticks in descending order from top to bottom', () => {
            const { lastFrame } = render(
                <Axis type="y" min={0} max={100} length={5} tickCount={3} />
            );
            const output = stripAnsi(lastFrame() ?? '');
            const lines = output.split('\n').map(l => l.trim()).filter(Boolean);
            // first row should be the maximum value
            expect(lines[0]).toBe('100');
        });

        it('should not render ticks when tickCount is 0', () => {
            const { lastFrame } = render(
                <Axis type="y" min={0} max={100} length={10} tickCount={0} />
            );
            const output = stripAnsi(lastFrame() ?? '');
            expect(output.trim()).toBe('');
        });
    });
});
