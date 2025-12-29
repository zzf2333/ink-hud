import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { Panel } from '../../src/components/Panel';

function stripAnsi(input: string): string {
    return input.replace(
        // biome-ignore lint/suspicious/noControlCharactersInRegex: Standard ANSI strip regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '',
    );
}

describe('Panel', () => {
    it('should render child component content', () => {
        const { lastFrame } = render(
            <Panel>
                <Text>Content</Text>
            </Panel>,
        );
        expect(stripAnsi(lastFrame() ?? '')).toContain('Content');
    });

    it('should display title', () => {
        const { lastFrame } = render(
            <Panel title="My Title">
                <Text>Content</Text>
            </Panel>,
        );
        expect(stripAnsi(lastFrame() ?? '')).toContain('My Title');
    });

    it('should support different title alignments', () => {
        // Simple visual check logic is hard with just strings, but we can check if it renders without error
        // and ideally check relative position if we parse the layout,
        // but for now verifying it renders the title is a good baseline.
        const { lastFrame } = render(
            <Panel title="Center Title" titleAlignment="center" width={40}>
                <Text>Content</Text>
            </Panel>,
        );
        expect(stripAnsi(lastFrame() ?? '')).toContain('Center Title');
    });

    it('should correctly apply padding', () => {
        // Without padding
        const { lastFrame: paramsNoPadding } = render(
            <Panel borderStyle="single" width={20}>
                <Text>Test</Text>
            </Panel>,
        );

        // With padding
        const { lastFrame: paramsWithPadding } = render(
            <Panel borderStyle="single" padding={1} width={20}>
                <Text>Test</Text>
            </Panel>,
        );

        // Use not.toEqual to ensure padding changes the output structure
        expect(paramsNoPadding()).not.toEqual(paramsWithPadding());
    });
});
