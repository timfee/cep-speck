# Safety Manual

This manual explains how to use and adjust the development safeguards installed to keep code simple, maintainable, and AI-agent friendly.

## What's Installed

- **Pre-commit hooks (Husky)**: lint-staged → test existence check → tests → complexity cap
- **Pre-push hook**: full repo lint + build verification
- **ESLint complexity rules**: `complexity` (max 15) and `sonarjs/cognitive-complexity` (max 15)
- **GitHub Actions**: CI (quality/tests/build) and a PR quality gate (FTA comparison)
- **Complexity tooling (FTA)**: scripts in `scripts/` and reports in `reports/`
- **Strict linting**: ESLint with `--max-warnings=0` enforcement

## Common Commands

- **Lint**: `pnpm lint`
- **Test**: `pnpm test`
- **Full verification**: `pnpm verify` (runs lint + tests + complexity check)
- **Generate complexity report**: `pnpm run complexity:json`
- **Check complexity cap**: `node scripts/check-fta-cap.mjs`
- **Build**: `pnpm build`

## Quality Gates

### Pre-commit (Automatic)

When you run `git commit`, the following checks run automatically:

1. **Lint-staged**: ESLint with no warnings allowed on staged files
2. **Test existence**: Ensures at least one test file exists
3. **Tests**: All Jest tests must pass
4. **Complexity cap**: FTA scores must be under the cap (default: 50)

### Pre-push (Automatic)

When you run `git push`, the following checks run:

1. **Full lint**: ESLint on entire codebase
2. **Build**: Next.js build must succeed

### PR Quality Gate (CI)

On pull requests, additional checks run:

1. **FTA Delta**: Changed files can't exceed complexity increase threshold (default: +10%)
2. **Hard Cap**: No files can exceed the absolute complexity cap
3. **Full CI**: All quality, test, and build checks must pass

## Adjusting Safeties

### Complexity Thresholds (FTA)

- **Hard cap**: Set `FTA_HARD_CAP` env var (default: 50) in CI variables or locally
- **Delta threshold**: Set `FTA_DELTA_PCT` env var (default: 10) for PR gate
- Local pre-commit uses the hard cap via `scripts/check-fta-cap.mjs`

### ESLint Complexity Rules

In `eslint.config.mjs`, adjust these rules:

- `complexity`: ['error', 15] - cyclomatic complexity limit
- `sonarjs/cognitive-complexity`: ['error', 15] - cognitive complexity limit

### Temporary Overrides

- **Skip hooks temporarily**: `git commit --no-verify` (use sparingly!)
- **Environment variables**:

  ```bash
  export FTA_HARD_CAP=60  # Temporarily raise cap
  pnpm run complexity:json && node scripts/check-fta-cap.mjs
  ```

### Commit Guard

Commits are blocked if no test files exist. Add at least one test file:

- `src/**/*.test.ts`
- `src/**/*.spec.ts`
- `tests/**/*.test.ts`
- `tests/**/*.spec.ts`

## File Structure

```none
.husky/
├── pre-commit         # Quality gates before commit
└── pre-push          # Build verification before push

scripts/
├── check-fta-cap.mjs      # Complexity cap enforcement
├── compare-fta.mjs        # PR complexity comparison
└── ensure-tests-exist.mjs # Test existence verification

.github/workflows/
├── ci.yml                 # Main CI pipeline
└── quality-gate.yml       # PR quality checks

reports/
└── fta.json              # Generated complexity analysis
```

## Disabling or Removing Pieces

- **Temporarily disable hooks**: `git commit --no-verify` or comment lines in `.husky/*`
- **Remove Husky entirely**: delete `.husky/` and `prepare` script in `package.json`
- **Remove CI**: delete workflows in `.github/workflows/`
- **Remove complexity checks**: delete scripts and remove from hooks

## Troubleshooting

### Common Issues

- **Tests missing**: Pre-commit fails with "No test files found". Add at least one test file.
- **FTA cap exceeded**: Lists offending files. Refactor or temporarily raise `FTA_HARD_CAP` with caution.
- **Hooks not firing**: Ensure `pnpm install` was run after adding Husky (to install git hooks).
- **Lint failures**: Fix ESLint issues or adjust rules in `eslint.config.mjs`.

### Environment Variables

Set these to adjust thresholds:

- `FTA_HARD_CAP`: Maximum complexity score allowed (default: 50)
- `FTA_DELTA_PCT`: Maximum complexity increase for changed files (default: 10%)

## Philosophy

These safeguards are designed to:

1. **Keep code simple**: Complex code is hard for AI agents to reason about
2. **Ensure test coverage**: Tests catch regressions and guide development
3. **Enforce consistency**: Uniform code style and structure
4. **Prevent technical debt**: Quality gates catch issues before they accumulate
5. **Support AI development**: Simple, well-tested code is easier for AI to understand and modify

The goal is to maintain a codebase that both human developers and AI agents can work with effectively, preventing the gradual degradation that often occurs in AI-assisted development projects.

---

**Remember**: These gates exist to help maintain code quality. If you find yourself frequently bypassing them, consider whether the thresholds need adjustment or if the code architecture needs refactoring.
