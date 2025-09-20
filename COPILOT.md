# COPILOT.md

Comprehensive guidance for collaborating with AI assistants ("Copilot") in this repository. This document establishes conventions so outputs are predictable, reviewable, and high-quality.

---

## 1. Purpose & Scope

This project generates and validates Product Requirement Documents (PRDs) for Chrome Enterprise Premium (CEP). Copilot is used to:

- Draft structured PRDs aligned to internal style
- Apply layered validation (structure, metrics, traceability, realism)
- Heal / auto-remediate issues when safe
- Accelerate competitive research and metric articulation (within factual constraints)

Out of Scope:

- Inventing unverifiable market data
- Replacing critical human product judgment
- Making licensing or legal commitments

---

## 2. Core Concepts

**Spec Pack**: Configuration describing validation items, heal policy, and composition constraints (see `src/lib/spec/packs/*`).
**Validation Item**: Module implementing `toPrompt`, `validate`, and optionally `heal` (see `src/lib/spec/items/`).
**Issue**: Structured validation finding `{ id, itemId, severity, message, evidence?, hints? }`.
**System Prompt**: Aggregated instruction block produced by `buildSystemPrompt` in `src/lib/spec/prompt.ts` + (upcoming) critical validation rules block.

---

## 3. Prompting Principles

When asking Copilot to author or refine PRDs:

1. Provide intent + constraints: "Need TL;DR emphasizing security posture improvements and quantifiable admin time savings."
2. Prefer deltas over restating whole document when refining: "Tighten Success Metrics to add timeframe + SoT for metric #2 and #3."
3. Avoid vague directives: Replace "make stronger" with measurable instruction: "Reduce TL;DR from 180 → ≤120 words; preserve 3 core feature names."
4. For research: specify retrieval timeframe and desired citation style.

### 3.1 Good Prompt Examples

- "Generate Section 6 (Functional Requirements) for 3 features: automated baseline policy audit, risk-driven alert throttling, delegated admin review. Each: acceptance criteria bullets, Target SKU, instrumentation plan."
- "Heal only issues: metrics-missing-attrs and tldr-feature-mismatch; keep wording otherwise stable."

### 3.2 Anti-Patterns

| Anti-Pattern      | Better Alternative                                                           |
| ----------------- | ---------------------------------------------------------------------------- |
| "Improve clarity" | "Shorten sentences >25 words; eliminate passive voice in TL;DR."             |
| "Add metrics"     | "For each Problem bullet, add 1 baseline + 1 target with timeframe and SoT." |
| "More persuasive" | "Add quantified cost-of-not-doing (# affected admins, avg time cost)."       |

---

## 4. Validation Stack Overview

Current registered items (see `src/lib/spec/items/index.ts`):

- `section-count`: Enforces expected section presence/quantity.
- `metrics-required`: Ensures metrics include timeframe, units, and SoT (param-driven).
- `banned-text`: Blocks prohibited phrases / fluff.
- `label-pattern`: Governs header label formatting.
- `word-budget`: Enforces section or total length constraints.
- `competitor-research`: Ensures competitor insights appear when required.
- `executive-quality`: Style/voice constraints for leadership tone.

Planned / Open Issues (Created):

- #1 `cross-section-consistency`
- #2 `technical-feasibility`
- #3 `traceability-complete`
- #4 `placeholder-quality`
- #5 `sku-differentiation`
- #6 System prompt critical rules block
- #7 `persona-coverage`
- #8 `executive-summary-coherence`

### 4.1 Severity Model

- `error`: Must fix before sign-off / generation pass considered valid.
- `warn`: Advisory; may defer if rationale documented.

### 4.2 Healing Philosophy

Healing attempts are deterministic, minimal-diff modifications. Avoid semantic inflation. If uncertain, insert explicit placeholders instead of guessing.

---

## 5. Adding a New Validation Item

### Architecture Overview

The validation system is a **two-layer async pipeline**:

1. **Deterministic Layer (`kind: 'linter'` or `'structure'`):** Fast, synchronous logic (e.g., regex, word count) that runs first. If it returns an `error`, the pipeline FAILS FAST.
2. **Semantic Layer (`kind: 'policy'`):** Slow, `async` AI-driven checks that run second. These use `generateObject` to validate meaning, coherence, and realism.

### Adding a New Validation Item

1. Create file in `src/lib/spec/items/`:
   - Export `itemId`.
   - Implement `toPrompt(params, pack?)` returning single-line imperative rule.
   - Your `validate` and `heal` functions **MUST** be `async`:

     ```typescript
     // src/lib/spec/items/myNewCheck.ts
     import type { Issue } from "../types";

     export const itemId = "my-new-check";

     export function toPrompt(params: any): string {
       return "This is the prompt fragment.";
     }

     export async function validate(
       draft: string,
       params: any
     ): Promise<Issue[]> {
       // validation logic
       return [];
     }

     export async function heal(issues: Issue[]): Promise<string | null> {
       if (!issues.length) return null;
       return "Fix the bad word.";
     }
     ```

2. **IMPORTANT:** If your check is semantic (e.g., "is this section logical?"), do NOT add a new validator. Instead, **add your logic to the central `semantic-policy-validator.ts`** module. Add your check to its `MegaValidationSchema` and its `validate` function. This prevents the N+1 AI call bottleneck.
3. Register your _new_ deterministic item in `src/lib/spec/items/index.ts`.
4. Add your _new_ deterministic item to `src/lib/spec/packs/prd-v1.json` with the correct `kind`.
5. Update documentation (this file) if conceptually new.
6. (Optional) Provide sample failing + passing snippet in issue description or fixture file.

### 5.1 Minimal Template

```ts
import type { Issue } from "../types";
export const itemId = "example-id";
export type Params = {
  /* param types */
};
export function toPrompt(p: Params): string {
  return "Single line rule description.";
}
export function validate(draft: string, p: Params): Issue[] {
  return [];
}
export function heal(issues: Issue[], p: Params): string | null {
  return null;
}
```

### 5.2 Issue ID Naming

- Use kebab-case, prefix context if ambiguous (e.g., `metric-inconsistency`, `unrealistic-adoption`).
- Keep consistent with existing style.

### 5.3 Evidence & Hints

- `evidence`: Minimal substring enabling reviewer context.
- `hints`: Machine-readable mini-tags (e.g., `missing:units`, `missing:timeframe`).

---

## 6. System Prompt Composition

`buildSystemPrompt(pack)` aggregates each item's `toPrompt` output plus composition constraints (`labelPattern`, `headerRegex`).
Upcoming change (#6) will append a static block (`CRITICAL VALIDATION REQUIREMENTS`). Avoid duplicating rules already expressed by items; static block sets global governance norms.

Guideline: `toPrompt` lines must remain concise; long-form rationale belongs here or in issues.

---

## 7. Traceability & Coverage Strategy

Target end-state chain:
`Persona → Problem → Goal → CUJ → Feature → Metric (baseline + target)`
Validation progression:

1. Existence & section structure.
2. Metric attribute completeness.
3. Cross-section consistency (#1).
4. Traceability completeness (#3).
5. Persona coverage (#7).
6. Executive summary coherence (#8).

Coverage Map (future): add `coverage` object to `ValidationReport` referencing each segment boolean.

---

## 8. Metric Standards

Every metric line should include:

- Baseline value + units
- Target value + units and timeframe ("within 90 days of GA")
- Source of Truth (SoT) system
- Explicit directionality (increase/decrease)

Invalid: `Reduce setup time significantly`
Valid: `Reduce median initial policy deployment time from 45 minutes baseline (CBCM telemetry) to 20 minutes within 90 days of GA.`

---

## 9. Placeholder Quality

Format: `[PM_INPUT_NEEDED: <specific instruction>]`
Must contain: data attribute, unit (if metric), timeframe (if projection), data source if metric. Replace vague stubs quickly (#4).

---

## 10. Technical Realism Heuristics

- Avoid 100% claims (human adoption, error elimination, etc.).
- Typical adoption ramp (enterprise admin tools): 10–20% month 1 active usage, 40–60% by month 3, 70–80% stabilized.
- Performance improvements must cite baseline measurement methodology (sample size, date range if possible).
- Reject >100% percentages (error) and highlight suspiciously high early adoption (#2).

---

## 11. SKU Differentiation Principles

Feature must state one: `Core`, `Premium`, or `Both`.
If Premium only: justify on one axis (cost-to-serve, advanced use case, risk reduction, complexity). If in Premium spec but Core, explain upgrade path / differentiation (#5).

---

## 12. Healing Policies

Heal operations should:

- Modify only lines implicated by issues.
- Preserve author voice where possible.
- Add clarifying metrics instead of deleting ambiguous lines when salvageable.
- Insert placeholders if hard data is missing.

Refusal Conditions: If healing would require fabricating unverifiable competitive data, respond with placeholder insertion instructions.

---

## 13. Coding Conventions

- TypeScript strictness: prefer explicit types for exported functions.
- Avoid heavy regex backtracking; precompile if reused in loops.
- Keep validators < ~120 LOC; refactor shared helpers to `src/lib/spec/` (e.g. `extract.ts` future).
- No inline license headers.
- Unit test naming (future): `<itemId>.spec.ts`.

---

## 14. Folder Expectations

```text
src/
  lib/
    spec/
      items/          # validation item modules
      packs/          # pack JSON descriptors
      healing/        # heal aggregation strategies
      prompt.ts       # system prompt builder
      registry.ts     # item registration
      types.ts        # shared types
```

---

## 15. PR Workflow

1. Open issue or reference existing (#1–#8 etc.).
2. Branch naming: `feat/<item-id>` or `chore/prompt-rules`.
3. Add validator + registration + pack update.
4. (Optional) Add test fixture.
5. Run lint & build.
6. PR template should include: Summary, Implementation Notes, Risks, Follow Ups.
7. Reviewer checklist:
   - Item registered? (see `getRegisteredItemIds()` path usage)
   - `toPrompt` concise? (≤140 chars ideally)
   - `validate` pure & deterministic?
   - `heal` safe (no speculation)?

---

## 16. Privacy & Safety

- Do not paste confidential internal-only metrics or customer names.
- Use placeholders with precise intent when restricted: `[PM_INPUT_NEEDED: baseline % of admins enabling feature X from internal telemetry]`.
- Avoid storing raw scraped competitor pages; store summarized structured data with citation URLs.

---

## 17. Troubleshooting

| Symptom                         | Cause                     | Resolution                                       |
| ------------------------------- | ------------------------- | ------------------------------------------------ |
| Missing validation output       | Item not registered       | Update `items/index.ts` with `registerItem` call |
| Duplicate issues                | Overlapping regex capture | Tighten pattern or add de-dup guard              |
| Prompt too long                 | Item `toPrompt` verbose   | Compress language / move rationale here          |
| False positive adoption warning | Generic wording match     | Narrow regex around adoption context             |

---

## 18. Future Enhancements

- Semantic embedding matching for traceability rather than substring heuristics.
- Coverage map output in `ValidationReport` for UI progress bars.
- Configurable realism thresholds via pack params.
- Healer auto-synthesis using chain-of-thought summarization (guarded).
- Benchmark harness for validator performance on large drafts.

---

## 19. Quick Reference Checklists

### Draft Before Validation

- [ ] All required sections present
- [ ] Feature headings labelled `## F<n> — <Name>`
- [ ] Metrics include baseline, target, timeframe, SoT
- [ ] Placeholders specific

### Pre-PR

- [ ] New item has tests (if infra available)
- [ ] Added to pack JSON
- [ ] No circular dependencies

---

## 20. FAQ

**Q:** Why keep rules both in prompt and validators?
**A:** Prompt shapes generation; validators enforce post-hoc invariants and catch drift.

**Q:** When to add `heal`?
**A:** Only when a deterministic transformation exists (e.g., adding missing metric attributes if placeholders already encode structure).

**Q:** How to handle partially known metrics?
**A:** Insert dual placeholders: baseline + target separately for clarity.

---

## 21. Contributing Summary (TL;DR for Humans & Copilot)

1. Keep `toPrompt` lines crisp.
2. Provide deterministic validators; no network calls inside `validate`.
3. Use errors for must-fix, warns for judgment areas.
4. Prefer specificity over deletion when healing.
5. Never fabricate data: use structured placeholders.

---

End of COPILOT guidelines.

---

## 22. Deterministic Validation & Self-Review Policy

This repository enforces a strictly deterministic first-pass validation before any AI heuristic / probabilistic review:

### Deterministic Layer (Primary)

- Always fail fast on the first `error` severity item (design choice: faster feedback + reduces token use).
- Validators must be pure functions of `(draft, params, pack)` with no network or time-based behavior.
- Trivial empty `Params` types are forbidden; omit if no params required.
- Healing instructions should be idempotent: applying them twice should not further change a compliant draft.

### AI Self-Review Layer (Secondary, Planned)

- After deterministic validation, a lightweight model pass MAY confirm or discard borderline issues (especially style or feasibility warnings) to reduce false positives.
- Target output: structured JSON `{ keep: IssueID[], drop: IssueID[], rationale?: string }`.
- The model never introduces new issues—only filters existing ones or enriches healing rationale.
- If model parsing fails or output invalid, fallback to deterministic issues unchanged.

### Design Principles

- Do not re-implement generalized NLP classification; leverage model summarization when ambiguity is high.
- Preserve document organic style: healers must not rewrite entire sections unless structure violations require.
- Avoid multi-hop speculative reasoning chains; single pass summarization + directive is sufficient.

### Healer Authoring Checklist

- [ ] Only references issue IDs produced by its validator.
- [ ] Does not ask model to generate unverifiable market claims.
- [ ] Provides explicit formatting patterns where adding content (e.g., `**Target SKU:** Premium — rationale`).
- [ ] Uses imperative verbs ("Add", "Replace", "Annotate") not vague guidance.

### Common Anti-Patterns

| Pattern                         | Why Rejected                        | Correct Approach                                     |
| ------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| Global rewrite suggestion       | Erodes author voice                 | Localized line edits only                            |
| Adding invented metrics         | Risk of hallucination               | Insert `[PM_INPUT_NEEDED: metric baseline <detail>]` |
| Looping self-review until clean | Token waste, risk of homogenization | Single confirm pass; then heal                       |

### Runtime Guarantees

- Validation will never proceed to healing if pack structural validation fails (`assertValidSpecPack`).
- Self-review (when added) runs only after at least one `error` or `warn` is present; skipped on clean drafts.
- Fail-fast ensures upper bound on unnecessary validator execution time.

**Rationale**
Fail-fast + minimal deterministic surface keeps the system predictable and cheap, while optional model filtering prevents overfitting to brittle regexes.
