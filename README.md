# CEP Agentic PRD Generator

A Next.js application that turns unstructured product briefs into validated Product Requirements Documents (PRDs) using a multi-phase chain of large-language-model (LLM) agents. The legacy modular "spec item" registry has been replaced with a simpler, configuration-driven workflow orchestrated by the client.

## Agentic Architecture

The system follows four explicit phases that correspond to dedicated agents located in `src/lib/agents/` and prompted via guides in `/guides`:

1. **Outliner** – Accepts the raw brief and returns a structured outline JSON. Users can edit section order, titles, and notes before continuing.
2. **Drafter** – Streams the first full PRD draft from the approved outline. It automatically augments prompts with `/knowledge` context and can issue research tasks.
3. **Evaluator** – Scores the draft against `guides/style_and_principles_guide.md` and returns a structured list of issues.
4. **Refiner** – Repairs the draft using the evaluator report. The client repeats evaluate → refine until the report is empty or a retry limit is hit.

These prompts are stored in `/guides` so product teams can adjust behaviour without redeploying code. The backend is stateless; all workflow state (brief, outline, drafts, reports) lives in the browser.

## API Contract

`POST /api/generate`

```json
{ "phase": "outline", "brief": "Unstructured idea" }
{ "phase": "draft", "outline": { ... } }
{ "phase": "evaluate", "draft": "..." }
{ "phase": "refine", "draft": "...", "report": [ ... ] }
```

The handler in `src/app/api/generate/route.ts` routes each phase to the corresponding agent. Outline and evaluation phases return JSON; draft and refine phases stream raw text for responsive UI updates.

## Frontend Workflow

`StructuredPrdWizard` (`src/components/workflow/StructuredPrdWizard.tsx`) manages the client-side state machine:

- **Idea Capture** – Collects the free-form brief.
- **Outline Review** – Calls `phase: "outline"`, renders editable sections, and lets the user tweak notes.
- **Generate** – Triggers draft streaming, then automatically loops through evaluation and refinement phases, surfacing status chips such as "Draft in progress", "Evaluating", and "Applying refinements".
- **Complete** – Presents the final, validated PRD and remaining issues (if the refinement limit was reached).

Networking helpers in `src/hooks/workflowApi.ts` encapsulate the `/api/generate` contract, while `src/hooks/refinementLoop.ts` coordinates evaluation/refinement retries.

## Guides & Configuration

| File                                   | Purpose                                                     |
| -------------------------------------- | ----------------------------------------------------------- |
| `guides/functional_requirements.md`    | Functional specification for the full workflow              |
| `guides/system_architecture_guide.md`  | Agent responsibilities and API design                       |
| `guides/generation_flow_guide.md`      | Detailed end-to-end flow, including search/RAG expectations |
| `guides/style_and_principles_guide.md` | Quality bar enforced by the evaluator agent                 |

Update these markdown files to adjust behaviour instead of editing TypeScript prompts directly.

## Knowledge & Research

- Place reusable background material in `/knowledge`. The drafter agent ingests relevant files at runtime.
- Web research hooks live in `src/lib/research/`. They can be stubbed in tests and extended with custom providers.

## Development

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Setup

```bash
pnpm install
```

Create `.env.local` with your AI credentials:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### Local Run

```bash
pnpm dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to launch the structured wizard.

## Testing

- `pnpm test` – Runs unit tests.
- `pnpm exec playwright test` – Executes the end-to-end suite in `tests/e2e`, verifying outline creation, draft streaming, and the iterative refinement loop with stubbed `/api/generate` responses.

Playwright tests stub network calls so they run deterministically without external AI access.

## Contributing Tips

- Keep the workflow state machine in hooks and components thin; agent prompts and limits belong in `/guides` and `src/lib/agents`.
- Avoid reintroducing the deprecated spec registry or micro-validator pattern. New behaviour should be expressed through agent prompts, not nested TypeScript abstractions.
- When modifying agents, update the relevant guide and add/extend Playwright coverage to lock in the UX contract.
