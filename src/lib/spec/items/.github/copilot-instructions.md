# Validation Item Development Guidelines

This directory contains modular validation items for the CEP PRD validation system. Each item is a self-contained module implementing deterministic validation logic.

## Development Principles

- **Deterministic**: All validators must be pure functions with no network calls, randomness, or time-based behavior
- **Minimal**: Keep each item focused on a single validation concern (≤120 LOC)
- **Idiomatic**: Follow the established 3-function pattern: `toPrompt`, `validate`, `heal`
- **DRY**: Use shared helpers from `../helpers/` for common patterns
- **Not Over-engineered**: Simple, readable code over complex abstractions
- **Not Hacked Together**: Proper TypeScript types, clear function signatures, meaningful variable names

## Required Implementation Pattern

```typescript
import type { Issue } from "../types";

export const itemId = "kebab-case-id";
export type Params = { /* explicit param types */ };

export function toPrompt(params: Params, pack?: SpecPack): string {
  // Single line imperative rule (≤140 chars ideally)
  return "Brief validation requirement for AI prompt.";
}

export function validate(draft: string, params: Params, pack?: SpecPack): Issue[] {
  // Pure deterministic validation logic
  const issues: Issue[] = [];
  // ... validation logic
  return issues;
}

export function heal(issues: Issue[], params: Params, pack?: SpecPack): string | null {
  // Optional: Return healing instructions or null
  // Must be idempotent - applying twice shouldn't change compliant content
  return null;
}
```

## Style Guidelines

- **Issue IDs**: Use kebab-case with context prefix if ambiguous (e.g., `metric-missing-units`, `header-pattern-mismatch`)
- **Evidence**: Include minimal substring that enables reviewer context
- **Hints**: Add machine-readable tags (e.g., `missing:timeframe`, `invalid:percentage`)
- **Severity**: Use `error` for must-fix issues, `warn` for advisory ones
- **Messages**: Be specific and actionable, not vague

## Anti-patterns to Avoid

- ❌ Network calls in `validate()` function
- ❌ Time-based validation (current date, relative times)
- ❌ Empty or trivial `Params` types (omit if no params needed)
- ❌ Vague healing instructions ("improve clarity")
- ❌ Regex patterns that cause backtracking
- ❌ Fabricating data in healing suggestions

## Pre-commit Checklist

- [ ] Item registered in `index.ts`
- [ ] Added to relevant pack JSON in `../packs/`
- [ ] `toPrompt` is concise (≤140 chars)
- [ ] `validate` is deterministic and pure
- [ ] `heal` provides specific instructions (if implemented)
- [ ] TypeScript builds without errors
- [ ] Follows consistent naming patterns