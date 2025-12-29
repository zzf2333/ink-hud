# Contributing Guide

Thank you for your interest in ink-hud! We welcome contributions of all kinds.

## How to Contribute

### Reporting Bugs

If you find a bug, please [create an Issue](https://github.com/zzf2333/ink-hud/issues/new) and provide:

- Detailed description of the bug
- Steps to reproduce
- Expected behavior vs actual behavior
- Your environment info (Node version, terminal type, OS)
- If possible, provide minimal reproduction code

### Proposing New Features

Before developing a new feature, please [create an Issue](https://github.com/zzf2333/ink-hud/issues/new) to discuss:

- Purpose and use cases of the feature
- API design draft
- Implementation approach (if available)

Wait for maintainer feedback before starting development to avoid wasted effort.

### Submitting Pull Requests

1. **Fork the repository** and clone locally:

```bash
git clone https://github.com/YOUR_USERNAME/ink-hud.git
cd ink-hud
```

2. **Install dependencies**:

```bash
pnpm install
```

3. **Create a branch**:

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-description
```

4. **Develop**:

- Ensure code passes Biome checks: `pnpm lint`
- Ensure type checking passes: `pnpm typecheck`
- Add tests (unit test coverage should be > 80%)
- Run tests: `pnpm test`

5. **Commit code**:

Use standardized commit messages (following [Conventional Commits](https://www.conventionalcommits.org/)):

```bash
git commit -m "feat: add BarChart component"
git commit -m "fix: resolve Braille rendering boundary issue"
git commit -m "docs: update README examples"
```

Type descriptions:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code formatting (no functional changes)
- `refactor`: Refactoring
- `test`: Test related
- `chore`: Build/tooling related

6. **Push and create PR**:

```bash
git push origin feature/my-new-feature
```

Then create a Pull Request on GitHub.

## Development Standards

### Code Style

- Use 4-space indentation (configured in Biome)
- Code comments in English
- Function names use camelCase
- Component names use PascalCase
- Avoid more than 3 levels of indentation

### Testing Requirements

- Every new feature must have corresponding unit tests
- Test files go in `test/` directory, mirroring `src/` structure
- Use Vitest + ink-testing-library

### Documentation Requirements

- All public APIs must have JSDoc comments
- New features need examples in README.md
- Major updates require CHANGELOG.md updates

## Project Structure

```
ink-hud/
├── src/          # Source code (production code only)
├── test/         # Test files (mirroring src structure)
├── examples/     # Usage examples
├── docs/         # Documentation
└── .github/      # CI/CD configuration
```

## Local Development

```bash
# Development mode (auto-rebuild)
pnpm dev

# Run tests (watch mode)
pnpm test:watch

# Code linting
pnpm lint

# Type checking
pnpm typecheck

# Build
pnpm build
```

## Questions and Discussions

- Having issues? Check [Issues](https://github.com/zzf2333/ink-hud/issues)
- Want to discuss? Use [Discussions](https://github.com/zzf2333/ink-hud/discussions)

## Code of Conduct

Please follow the [GitHub Community Guidelines](https://docs.github.com/en/site-policy/github-terms/github-community-guidelines) and be kind and respectful.

---

Thank you again for your contribution! 🎉
