# TODO

- [x] Phase 0: Establish configuration guides (`/guides` files for functional requirements, architecture, flow, style).
- [x] Phase 1: Capture legacy behavior with Playwright baseline tests (`tests/e2e/baseline.spec.ts`).
- [x] Phase 2: Backend refactor to agentic architecture
  - [x] Remove legacy `/api/run` generation loop and associated spec registry/healing modules.
  - [x] Implement `/api/generate` endpoint routing phases to dedicated agents.
  - [x] Implement outliner, drafter, evaluator, and refiner agents loading external prompts.
- [x] Phase 3: Frontend refactor to call new API and remove serialization helpers (`StructuredPrdWizard`, `useStructuredWorkflow`).
  - [x] Replace serialization helpers with direct `/api/generate` orchestration in `useStructuredWorkflow`.
  - [x] Rebuild structured wizard UI around outline editing, streaming draft display, and evaluation status.
  - [x] Remove traditional mode and legacy spec-driven hooks/components.
  - [x] Update residual shared UI pieces (e.g., metrics widgets) or documentation impacted by the new flow.
- [x] Phase 4: Replace baseline E2E tests with new agentic workflow coverage.
  - [x] Add outline-generation Playwright coverage for `/api/generate` phase="outline".
  - [x] Add draft streaming Playwright coverage for phase="draft".
  - [x] Add refinement loop Playwright coverage for evaluate/refine phases.
- [x] Phase 5: Final cleanup (remove obsolete ESLint rule references, prune old helpers, update README/COPILOT docs).
- [x] Final sanity check: prune unused workflow helpers, relocate Jest specs into `__tests__`, and keep the PRD page server-wrapped.
