import React from 'react';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { Sparkline } from '../../src/components/Sparkline';

describe('Sparkline', () => {
    it('renders data points', () => {
        const data = [10, 20, 15, 25, 30, 10, 5];
        const { lastFrame } = render(
            <Sparkline data={data} />
        );
        expect(lastFrame()).not.toBe('');
    });
});
