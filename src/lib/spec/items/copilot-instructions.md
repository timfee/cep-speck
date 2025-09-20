# Va### Module Creation Guidelines

### Required Module Structure

Every validation item module MUST follow this exact pattern:

```typescript
import type { Issue, SpecPack } from "../types";

export const itemId = "kebab-case-id";
export type Params = {
  // Parameter interface - use 'void' if no params needed
};

async function toPrompt(params: Params, pack?: SpecPack): Promise<string> {
  // Return single line rule description for AI
}

async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  // Deterministic validation logic - NO network calls
  return [];
}

async function heal(
  issues: Issue[],
  params: Params,
  pack?: SpecPack
): Promise<string | null> {
  // Optional healing instructions
  return null;
}

// REQUIRED: Export as module object for registry system
export const itemModule = { itemId, toPrompt, validate, heal };
```

### Required Exportsation Items Instructions

This directory contains individual validation modules that implement the modular validation system.

## Module Creation Guidelines

### Required Exports

Every validation item module MUST export an `itemModule` object with:

- `itemId`: kebab-case string identifier
- `toPrompt()`: Contributes to AI system prompt (async)
- `validate()`: Performs deterministic validation (async)
- `heal()`: Optional healing instructions (async)

### Function Signatures (Strict)

```typescript
export const itemId: string;
export type Params = {
  /* interface */
};

async function toPrompt(params: Params, pack?: SpecPack): Promise<string>;
async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]>;
async function heal(
  issues: Issue[],
  params: Params,
  pack?: SpecPack
): Promise<string | null>;

// REQUIRED: Export as module object
export const itemModule = { itemId, toPrompt, validate, heal };
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
# 1. Create your module file following the exact pattern above
# 2. Register in index.ts:
import { itemModule as yourModule } from "./yourModule";
registerItem(createValidatorModule(yourModule));

# 3. Add to pack configuration in packs/prd-v1.json
# 4. Test end-to-end
pnpm dev
# 5. Verify in browser at localhost:3000
```

## Current Validation Modules

The following modules are currently implemented:

- `bannedText` - Detects forbidden terms and buzzwords
- `competitorResearch` - Validates competitive analysis inclusion
- `labelPattern` - Enforces section numbering format
- `metricsRequired` - Validates metrics have units/timeframe/SoT
- `placeholderQuality` - Detects placeholder content
- `sectionCount` - Enforces minimum section requirements
- `semanticPolicyValidator` - AI-powered policy compliance
- `skuDifferentiation` - Validates SKU-specific features
- `technicalFeasibility` - Validates technical requirements
- `wordBudget` - Enforces word count limits
