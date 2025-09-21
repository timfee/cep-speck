# COPILOT.md

Guidelines for pairing with AI assistants when working in this repository. The system now operates as an agentic chain instead of a modular validator registry, so Copilot requests should reinforce that architecture.

---

## 1. Purpose & Scope

The application generates Chrome Enterprise Premium PRDs by orchestrating four LLM agents:

1. **Outliner** – Converts an unstructured brief into a structured outline JSON.
2. **Drafter** – Streams a full PRD using outline context, `/knowledge` snippets, and optional web research.
3. **Evaluator** – Compares the draft against `guides/style_and_principles_guide.md` and returns structured issues.
4. **Refiner** – Produces a corrected draft using the evaluator report until the quality bar is met or the loop limit triggers.

Copilot is ideal for:

- Drafting or editing agent prompts inside `/guides`.
- Updating client orchestration logic in `StructuredPrdWizard` and associated hooks.
- Adding Playwright coverage for new UX states or agent flows.
- Summarising evaluator reports or translating them into actionable follow-ups.

Out of scope:

- Reintroducing the deprecated spec registry, validator items, or "healing" modules.
- Hardcoding validation logic inside TypeScript instead of guides/prompts.
- Fabricating unverifiable research or metrics.

---

## 2. Collaboration Principles

- **Configuration over Code** – Prefer editing `/guides/*.md` for prompt or policy changes and reload them at runtime.
- **Single Responsibility Agents** – Keep agent behaviour focused: the evaluator never fixes drafts; the refiner never invents new sections.
- **Client-Orchestrated State** – The browser owns workflow state. Server code should remain stateless and route directly to agents.
- **Transparent UX** – Surface phase status to users (e.g., “Draft in progress”, “Evaluating”, “Applying refinements”). Tests should assert these statuses to prevent regressions.

---

## 3. Prompting Copilot Effectively

When requesting help from Copilot:

1. Specify the phase and data contract involved (`phase: "draft"` expects streaming text, etc.).
2. Reference the relevant guide or hook so Copilot updates both documentation and implementation if needed.
3. Provide concrete targets (e.g., “Adjust evaluator report schema to include `evidence` field and update Playwright test”).
4. For refinements, describe the evaluation findings rather than resupplying entire drafts.

### Good Prompts

- “Update `guides/style_and_principles_guide.md` to tighten success metric guidance, then adjust evaluator parsing to surface the new field.”
- “Add a Playwright assertion that the UI shows ‘Refining…’ when the `/api/generate` request includes `phase: "refine"`.”

### Anti-Patterns

| Anti-Pattern           | Preferred Alternative                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| “Improve the draft”    | “In the refiner prompt, emphasise adding quantifiable KPIs for Success Metrics.”                               |
| “Fix validation logic” | “Update the evaluator agent to flag metrics missing Source of Truth; adjust Playwright loop test accordingly.” |
| “Add new validator”    | “Extend the evaluator prompt in `/guides/style_and_principles_guide.md` with the new rule.”                    |

---

## 4. Testing Expectations

- **Unit Tests** – `pnpm test`
- **E2E Tests** – `pnpm exec playwright test`

All feature work should extend the Playwright suite when new UI phases, statuses, or agent behaviours are introduced. Tests stub `/api/generate` so they remain deterministic without live AI access.

---

## 5. Review Checklist for AI-Authored Changes

- [ ] Does `/guides` accurately describe any new agent behaviour?
- [ ] Are `/api/generate` payloads and responses aligned with the documented contract?
- [ ] Do hooks/components keep orchestration logic simple and client-driven?
- [ ] Are new tests covering success + loop conditions as appropriate?
- [ ] Is documentation (README, TODO, etc.) updated to reflect the current phase completion status?

Following these conventions keeps the project aligned with the agentic architecture and avoids falling back to the old validator registry.
