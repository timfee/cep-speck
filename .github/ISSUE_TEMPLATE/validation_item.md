---
name: Validation Item
about: Add or improve a validation rule
title: "[VALIDATION] "
labels: validation, enhancement
assignees: ""
---

**Validation Item Overview**
Brief description of the validation rule or improvement.

**Item ID**
Proposed identifier for the validation item (e.g., `semantic-quality`, `metrics-required`).

**toPrompt Implementation**
What instructions should this item contribute to the AI generation prompt?

```typescript
export function toPrompt(params: Params, pack?: SpecPack): string {
  // Your prompt contribution here
}
```

**validate Implementation**
What validation logic should be applied to generated content?

```typescript
export function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Issue[] {
  // Your validation logic here
}
```

**heal Implementation**
How should healing instructions be generated when validation fails?

```typescript
export function heal(
  issues: Issue[],
  params?: Params,
  pack?: SpecPack
): string | null {
  // Your healing logic here
}
```

**Parameters**
Define the TypeScript interface for this item's parameters:

```typescript
export type Params = {
  // Define parameters here
};
```

**Test Cases**
Describe test cases that should pass and fail validation:

**Passing Examples:**

- Example 1: ...
- Example 2: ...

**Failing Examples:**

- Example 1: ... (should trigger healing)
- Example 2: ... (should trigger healing)

**SpecPack Integration**
How should this be configured in `prd-v1.json`?

```json
{
  "your-item": {
    "param1": "value1",
    "param2": "value2"
  }
}
```
