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
   Output: stream<string> (full PRD draft)
   Responsibility: Write the full document based on the outline. Manages RAG (knowledge) and Web Search (research) sub-routines internally.
   EvaluatorAgent:
   Input: string (full PRD draft)
   Output: EvaluationReport (JSON)
   Responsibility: Critique the draft against the style_guide.md. Must not edit the draft. Must only list issues.
   RefinerAgent:
   Input: string (full PRD draft), EvaluationReport (JSON)
   Output: stream<string> (new full PRD draft)
   Responsibility: Fix all issues in the report. Must not introduce new concepts.

3. Minimal Indirection
   NO complex registry patterns (registry.ts).
   NO dynamic invocation of validator functions.
   NO hyper-granular items modules.
   The entire validation and healing logic is contained within the prompts for the EvaluatorAgent and RefinerAgent.
   The "source of truth" for quality is the style_and_principles_guide.md file, which serves as the master prompt for evaluation.

4. UI Layer
   The UI shall be a simple, single-page application (e.g., Next.js App Router).
   It will use a client-side state machine (e.g., useState or useReducer) to manage the current phase ("INPUT", "OUTLINE", "GENERATING", "EVALUATING", "REFINING", "DONE").
   All state (brief, outline, draft) is held on the client. The backend API is stateless and simply executes the requested agent.

5. API Layer
   Create a single API endpoint, e.g., /api/generate.
   This endpoint will accept the current phase and the necessary data for that phase. This is superior to the old system's "one endpoint for one flow."
   Example API Request Body:
   {
   "phase": "outline",
   "brief": "My unstructured text..."
   } // Server responds with StructuredOutline

{
"phase": "draft",
"outline": { ... } // The user-tweaked outline
} // Server streams back the full draft

{
"phase": "evaluate",
"draft": "The full generated draft text..."
} // Server responds with EvaluationReport

{
"phase": "refine",
"draft": "The full draft text...",
"report": { ... } // The list of issues
} // Server streams back the _new_ full draft

This architecture is modular, has clear data contracts (JSON/string), and places all domain-specific "business logic" (the validation rules) inside the LLM prompts, where it can be easily updated without redeploying code.
