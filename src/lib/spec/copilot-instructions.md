# Validation System Instructions

This directory contains the core validation system for CEP PRD generation. Follow these specific guidelines when working in this area.

## Core Principles

### Deterministic Validation Philosophy

- **Primary layer**: Deterministic, fast validation using regex/string matching
- **Secondary layer**: Optional AI-powered validation for ambiguous cases
- **Fail-fast**: Early exit on pack validation failures to avoid unnecessary computation
- **Predictable**: Validation outcomes must be reproducible across runs

### Modular Item Structure

Every validation item MUST follow this exact structure:

```typescript
import type { SpecPack, Issue } from "../types";

export const itemId = "kebab-case-id";
export type Params = {
  // Parameter interface
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  // Single line description for AI prompt (≤140 chars ideally)
  return "Brief rule description for AI generation.";
}

export function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Issue[] {
  // Deterministic validation logic - NO network calls
  return [];
}

export function heal(
  issues: Issue[],
  params?: Params,
  pack?: SpecPack
): string | null {
  // Optional healing instructions - only for deterministic fixes
  return null;
}
```

### Development Workflow

1. **Create item module** in `items/` directory
2. **Register in `items/index.ts`** for barrel export
3. **Add to pack configuration** in `packs/prd-v1.json`
4. **Test with complete workflow** using `pnpm dev`

### Validation Guidelines

- Use `error` severity for must-fix issues
- Use `warn` severity for judgment/style issues
- Provide specific `evidence` strings for context
- Include `hints` for machine-readable issue types
- Never fabricate data in healing - use structured placeholders

### Performance Requirements

- Validators must complete in <100ms for typical PRD documents
- No network calls inside `validate()` functions
- Use efficient string operations and regex patterns
- Cache expensive computations when appropriate

## Package Manager Usage

- ALWAYS use `pnpm` commands in this directory
- Use `pnpx` for package executables
- Test with `pnpm dev` after making changes
