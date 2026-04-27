# ink-hud Release Skill

You are executing the ink-hud release workflow. Follow these steps precisely and **stop to confirm with the user before any git push**.

## Step 1 — Parse release arguments

The user invokes this as `/release [patch|minor|major]` or `/release`.

- If no bump type is given, **ask the user**: "Which version bump? patch / minor / major"
- Only accept `patch`, `minor`, or `major`.

## Step 2 — Pre-flight checks

Run these in parallel and **abort if any fail**:

```bash
# 1. Working tree must be clean (no uncommitted changes)
git status --porcelain

# 2. Must be on main branch
git branch --show-current

# 3. Local main must be up-to-date with origin
git fetch origin main --quiet && git rev-list HEAD..origin/main --count
```

Rules:
- If working tree is not clean → stop, list dirty files, tell user to commit or stash first.
- If not on `main` → stop, tell user to switch to main first.
- If behind origin → stop, tell user to `git pull` first.

## Step 3 — Read CHANGELOG.md

Read `/Users/saonian/Code/OpenSource/ink-hud/CHANGELOG.md`.

Extract the content under `## [Unreleased]`. If this section is **empty or missing** → stop and tell the user:
> "CHANGELOG.md has no [Unreleased] content. Please document your changes before releasing."

## Step 4 — Compute new version

Read current version from `package.json` field `"version"`.

Apply the bump type:
- `patch`: increment the third number (e.g. `0.1.3` → `0.1.4`)
- `minor`: increment the second number, reset third to 0 (e.g. `0.1.3` → `0.2.0`)
- `major`: increment the first number, reset second and third to 0 (e.g. `0.1.3` → `1.0.0`)

New tag will be `v<new_version>` (e.g. `v0.1.4`).

**Confirm with the user before proceeding**:
> "Ready to release **v{new_version}** ({bump_type} bump from v{current_version}). Proceed? [y/N]"

If the user says no → abort.

## Step 5 — Update package.json version

Edit `package.json`: change the `"version"` field to the new version string.

Do not change any other fields.

## Step 6 — Update CHANGELOG.md

Today's date: read it from `date +%Y-%m-%d` via bash.

Make these changes to `CHANGELOG.md`:

1. Replace `## [Unreleased]` with two blocks:
   ```
   ## [Unreleased]

   ## [v{new_version}] - {today_date}
   ```
   Keep all the content that was under `[Unreleased]` under the new versioned heading.

2. At the bottom of the file, update the comparison links section:
   - Change the `[unreleased]` link from `.../compare/v{old_version}...HEAD` to `.../compare/v{new_version}...HEAD`
   - Add a new line: `[v{new_version}]: https://github.com/zzf2333/ink-hud/compare/v{old_version}...v{new_version}`

   Insert the new link **above** the existing `[v{old_version}]` line.

## Step 7 — Run quality checks

Run the full check suite. **Abort if anything fails**.

```bash
cd /Users/saonian/Code/OpenSource/ink-hud && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Show a one-line status per step. If a step fails: show the error output and stop — do **not** proceed to commit.

## Step 8 — Git commit and tag

Stage only the two changed files:
```bash
git add package.json CHANGELOG.md
```

Commit with message:
```
chore: release v{new_version}
```

Create an annotated tag:
```bash
git tag -a v{new_version} -m "Release v{new_version}"
```

Confirm what was staged and committed by showing `git show --stat HEAD`.

## Step 9 — Confirm and push

**Stop and ask the user**:
> "Commit and tag `v{new_version}` created locally. Push to origin to trigger npm publish and GitHub Release? This will run the CI/CD pipeline. [y/N]"

If yes:
```bash
git push origin main && git push origin v{new_version}
```

After pushing, print:
> "Tag `v{new_version}` pushed. GitHub Actions will run lint → typecheck → test → build → npm publish → GitHub Release.
> Monitor at: https://github.com/zzf2333/ink-hud/actions"

If the user says no:
> "Tag created locally. Run `git push origin main && git push origin v{new_version}` when ready."

## Notes

- **Never force-push, never skip hooks.**
- The `prepublishOnly` script (lint + typecheck + test + build) runs both locally (Step 7) and in CI — intentional double-check.
- npm publish happens in CI via `NPM_TOKEN` secret — do not run `npm publish` locally.
- If anything fails mid-flow, tell the user exactly what to clean up (e.g. `git tag -d v{new_version}` to remove a local tag).
