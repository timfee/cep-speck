1. Core Principle: Agentic Phases, Not Programmatic Validation
   The old system failed because it encoded business logic (metrics must have units) into rigid TypeScript modules (metricsRequired.ts) and used a complex registry (registry.ts) to run them.
   The new system will not do this. It will be an "agentic chain" where each step is a distinct LLM call (an "agent") that passes its structured output to the next.
   The Flow:
   (User Brief) -> Agent 1 (Outliner) -> (Structured Outline) -> (User Tweak) -> Agent 2 (Drafter w/ RAG+Search) -> (Full Draft) -> [LOOP] -> Agent 3 (Evaluator) -> (Evaluation Report) -> [IF ISSUES] -> Agent 4 (Refiner) -> (New Draft) -> [END LOOP]

2. Modularity
   Modularity is defined by the separation of concerns between agents, not by file structure.
   OutlinerAgent:
   Input: string (user brief)
   Output: StructuredOutline (JSON)
   Responsibility: Convert unstructured ideas into a logical PRD structure. Must not write prose.
   DrafterAgent:
   Input: StructuredOutline (JSON)
   Output: stream<string> (full PRD text)
   Responsibility: Write comprehensive, detailed PRD content. Include RAG context and web research. Must not self-evaluate.
   EvaluatorAgent:
   Input: string (full draft)
   Output: EvaluationReport (JSON array of issues)
   Responsibility: Find flaws against style guide. Must not fix anything, only report issues.
   RefinerAgent:
   Input: string (full draft) + EvaluationReport (JSON)
   Output: stream<string> (corrected full PRD text)
   Responsibility: Fix all issues listed in the evaluation report. Must not add new issues or evaluate.

3. Data Contracts
   All communication between phases uses simple, serializable formats:

- Brief: string
- StructuredOutline: JSON object with sections array
- Draft: string (full PRD text)
- EvaluationReport: JSON array of issue objects
- Refined Draft: string (corrected full PRD text)

4. Client-Side State Management
   The server is stateless. The client maintains:

- Current phase: "brief" | "outline" | "draft" | "evaluate" | "refine" | "done"
- Brief: string
- Outline: StructuredOutline | null
- Draft: string | null
- Evaluation: EvaluationReport | null
- Attempt count: number

5. API Design
   Single endpoint: POST /api/generate
   Request body: { phase: string, ...phase-specific data }
   Response: streaming text (for draft/refine) or JSON (for outline/evaluate)

Phase-specific requests:

- { phase: "outline", brief: string }
- { phase: "draft", outline: StructuredOutline }
- { phase: "evaluate", draft: string }
- { phase: "refine", draft: string, report: EvaluationReport }

6. Configuration over Code
   All prompts and business logic are stored in external files:

- /guides/functional_requirements.md
- /guides/style_and_principles_guide.md
- /guides/generation_flow_guide.md
- /knowledge/ directory for RAG context

Agents load these files at runtime, not hardcoded strings in TypeScript.

7. Error Handling
   Each agent can fail independently. Errors are returned as:
   { error: string, phase: string, recoverable: boolean }

Client decides whether to retry, skip, or abort based on error type.

8. Performance Requirements

- Outline generation: < 10 seconds
- Draft generation: 30-60 seconds with streaming
- Evaluation: < 5 seconds
- Refinement: 15-30 seconds with streaming
- Maximum 5 refinement iterations before giving up
