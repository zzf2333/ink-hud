import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { Grid, GridItem } from '../../src/components/Grid';

describe('Grid', () => {
    it('renders items in columns', () => {
        const { lastFrame } = render(
            <Grid columns={2}>
                <GridItem>
                    <Text>Item 1</Text>
                </GridItem>
                <GridItem>
                    <Text>Item 2</Text>
                </GridItem>
            </Grid>,
        );
        expect(lastFrame()).toMatch(/Item 1/);
        expect(lastFrame()).toMatch(/Item 2/);
    });
});
