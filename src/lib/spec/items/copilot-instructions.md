# Validation Items Instructions

This directory contains individual validation modules that implement the modular validation system.

## Module Creation Guidelines

### Required Exports

Every validation item module MUST export:

- `itemId`: kebab-case string identifier
- `Params`: TypeScript interface for configuration
- `toPrompt()`: Contributes to AI system prompt
- `validate()`: Performs deterministic validation
- `heal()`: Optional healing instructions

### Function Signatures (Strict)

```typescript
export const itemId: string;
export type Params = {
  /* interface */
};

export function toPrompt(params: Params, pack?: SpecPack): string;
export function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Issue[];
export function heal(
  issues: Issue[],
  params?: Params,
  pack?: SpecPack
): string | null;
```

### Implementation Standards

#### toPrompt() Function

- Return single line rule description for AI
- Keep under 140 characters when possible
- Be specific and actionable
- Example: "Include baseline, target, timeframe, and SoT for all metrics"

#### validate() Function

- MUST be deterministic (same input = same output)
- NO network calls or external dependencies
- Return empty array `[]` if no issues found
- Use clear, specific issue IDs and messages
- Provide evidence strings for debugging

#### heal() Function

- Only implement if deterministic transformation exists
- Return `null` if healing not possible/safe
- Use imperative verbs ("Add", "Replace", "Annotate")
- Provide explicit formatting patterns
- Never ask AI to generate unverifiable claims

### Issue Creation Pattern

```typescript
const issues: Issue[] = [];
if (problemDetected) {
  issues.push({
    id: "specific-problem-id",
    itemId,
    severity: "error", // or 'warn'
    message: "Human-readable description",
    evidence: "relevant text snippet",
    hints: ["machine-readable", "tags"],
  });
}
return issues;
```

### Common Patterns

- Use regex for structural validation
- Extract structured data with helper functions
- Validate against known patterns/requirements
- Report specific missing elements
- Avoid vague or subjective assessments

### Anti-Patterns

- Do not implement general NLP classification
- Do not make network calls in validate()
- Do not generate unverifiable market data
- Do not provide vague healing guidance
- Do not rewrite entire sections unless necessary

## Testing Your Items

```bash
# 1. Register in index.ts
# 2. Add to pack configuration
# 3. Test end-to-end
pnpm dev
# 4. Verify in browser at localhost:3000
```
