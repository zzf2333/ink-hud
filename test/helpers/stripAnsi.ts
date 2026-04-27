/**
 * Strip ANSI escape codes from a string.
 * Handles SGR sequences (ESC [ ... m) used by chalk / ink for colour.
 */
export function stripAnsi(input: string): string {
    let output = '';
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (char === '' && input[i + 1] === '[') {
            i += 2;
            while (i < input.length && input[i] !== 'm') {
                i++;
            }
            i++; // consume 'm'
            continue;
        }
        output += char ?? '';
        i++;
    }
    return output;
}
