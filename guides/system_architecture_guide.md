# System Architecture Guide

## 1. Core Principle: Agentic Phases, Not Programmatic Validation

The old system failed because it encoded business logic (metrics must have units) into rigid TypeScript modules (metricsRequired.ts) and used a complex registry (registry.ts) to run them.
The new system will not do this. It will be an "agentic chain" where each step is a distinct LLM call (an "agent") that passes its structured output to the next.
The Flow:
(User Brief) -> Agent 1 (Outliner) -> (Structured Outline) -> (User Tweak) -> Agent 2 (Drafter w/ RAG+Search) -> (Full Draft) -> [LOOP] -> Agent 3 (Evaluator) -> (Evaluation Report) -> [IF ISSUES] -> Agent 4 (Refiner) -> (New Draft) -> [END LOOP]

## 2. Modularity

Modularity is defined by the separation of concerns between agents, not by file structure.
OutlinerAgent:
Input: string (user brief)
Output: StructuredOutline (JSON)
Responsibility: Convert unstructured ideas into a logical PRD structure. Must not write prose.
DrafterAgent:
Input: StructuredOutline (JSON)
Output: stream<string> (full PRD draft)
Responsibility: Write complete, comprehensive PRD based on outline. Perform RAG and web search as needed.
EvaluatorAgent:
Input: string (full draft)
Output: EvaluationReport (JSON)
Responsibility: Find issues based on style guide. Must not fix issues, only identify them.
RefinerAgent:
Input: string (draft) + EvaluationReport (JSON)
Output: stream<string> (corrected draft)
Responsibility: Fix all issues listed in evaluation report. Generate complete new draft.

## 3. Data Flow Architecture

Client State:

- brief: string
- outline: StructuredOutline | null
- draft: string | null
- evaluationReport: EvaluationReport | null
- isLoading: boolean
- currentPhase: 'outline' | 'draft' | 'evaluate' | 'refine' | 'complete'

API Contract:
POST /api/generate
Body: { phase: string, ...payload }
Response: Stream (for draft/refine) or JSON (for outline/evaluate)

Phase Payloads:

- phase: 'outline', payload: { brief: string }
- phase: 'draft', payload: { outline: StructuredOutline }
- phase: 'evaluate', payload: { draft: string }
- phase: 'refine', payload: { draft: string, report: EvaluationReport }

## 4. Agent Implementation Pattern

Each agent is a simple function:

```typescript
export async function agentFunction(input: InputType): Promise<OutputType> {
  const prompt = await loadPromptFromFile();
  const systemPrompt = buildSystemPrompt(prompt, context);
  return await callLLM(systemPrompt, input);
}
```

No complex interfaces, registries, or abstractions. Pure functions that load prompts and call LLMs.

## 5. File Organization

```
src/lib/agents/
  outliner.ts      - Outliner agent implementation
  drafter.ts       - Drafter agent with RAG/search
  evaluator.ts     - Evaluator agent
  refiner.ts       - Refiner agent

guides/
  prompts/
    outliner.md    - Outliner system prompt
    drafter.md     - Drafter system prompt
    evaluator.md   - Evaluator system prompt
    refiner.md     - Refiner system prompt

src/app/api/generate/
  route.ts         - Simple router calling appropriate agent
```

## 6. Configuration Over Code

All business logic (what makes a good PRD, what constitutes an issue) lives in the prompt files under `/guides/prompts/`, not in TypeScript code. This allows rapid iteration without code deployment.

## 7. Error Handling

Each agent call should have simple error boundaries. If an agent fails, return an error to the client with a clear message. No complex retry logic or circuit breakers - keep it simple.

## 8. Testing Strategy

Test each agent in isolation by mocking LLM responses. Test the full workflow with integration tests that exercise the complete chain. No need for complex unit tests of validation logic since there is no programmatic validation logic.
