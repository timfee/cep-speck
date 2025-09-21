This guide details the exact agentic chain for generating a PRD.

Phase 1: Brief to Outline

1. User Action: User inputs an unstructured "brief" (e.g., "a tool to manage browser bookmarks for enterprise teams") and clicks "Generate Outline."
2. System Action: The client sends a request to the API with (phase: "outline", brief: string).
3. Agent 1 (Outliner): The server executes the "Outliner" agent.
   - System Prompt: "You are a world-class product manager. Your task is to analyze the following user brief and generate a structured JSON outline for a PRD. The outline should include standard sections like TL;DR, People Problems, Goals, Functional Requirements, Success Metrics, and Annexes. Add any other sections you deem relevant based on the brief."
   - User Prompt: (The user's brief string)
4. System Action: The agent returns a StructuredOutline JSON object.
   {
   "sections": [
   { "id": "1", "title": "TL;DR", "notes": "" },
   { "id": "2", "title": "People Problems", "notes": "" },
   { "id": "3", "title": "Functional Requirements", "notes": "" },
   { "id": "4", "title": "Success Metrics", "notes": "" }
   ]
   }
5. User Action: The UI renders this outline. The user can now edit it (add sections, delete, re-order, add notes under each).
   {
   "sections": [
   { "id": "1", "title": "TL;DR", "notes": "Focus on security." },
   { "id": "2", "title": "People Problems", "notes": "" },
   { "id": "3", "title": "Functional Requirements", "notes": "- Admin console for managing shared folders\n- RBAC" },
   { "id": "5", "title": "Competitor Analysis", "notes": "Check Island and Zscaler" },
   { "id": "4", "title": "Success Metrics", "notes": "" }
   ]
   }

Phase 2: Outline to Draft

1. User Action: User clicks "Generate Draft."
2. System Action: The client sends a request to the API with (phase: "draft", outline: StructuredOutline).
3. Agent 2 (Drafter): The server executes the "Drafter" agent.
4. Sub-routine (RAG): The system searches the /knowledge directory for files relevant to the outline's content. The content of these files is added to the system prompt.
5. Sub-routine (Web Search): The agent sees the "Competitor Analysis" section and the note "Check Island and Zscaler". It internally triggers a web search for "Island enterprise browser features" and "Zscaler secure browser features."
6. System Prompt: "You are an expert Google PM. Write a full, comprehensive, unabridged PRD based only on the provided JSON outline. Follow the section order and user notes precisely. Use a professional, concise, and factual tone. [Internal RAG context is injected here...]. You have web search capability. Use it to find information requested in the outline, and always cite your sources in a 'Footnotes' section."
7. User Prompt: (The StructuredOutline JSON object string)
8. System Action: The agent streams the full PRD draft (as text) back to the client.

Phase 3: Iterative Refinement Loop

1. System Action: Once the draft stream is complete, the client immediately sends a new request to the API with (phase: "evaluate", draft: string).
2. Agent 3 (Evaluator): The server executes the "Evaluator" agent.
   - System Prompt: "You are a PRD quality assurance expert. Analyze the following PRD draft. Your only job is to find flaws based on the 'Style & Principles Guide'. Respond only with a JSON array of issues. If there are no issues, return an empty array []. Do not be conversational. Do not fix the issues."
   - "Style & Principles Guide" (Injected into Prompt): (Content of style_and_principles_guide.md)
   - User Prompt: (The full draft string)
3. System Action: The agent returns an EvaluationReport (JSON).
   - Scenario A (No Issues): []
   - Scenario B (Issues Found):
     [
     {
     "section": "Success Metrics",
     "issue": "Vague Metric",
     "evidence": "Increase user engagement.",
     "suggestion": "Replace 'user engagement' with a specific, quantifiable metric like 'Daily Active Users (DAU)' or 'Average session duration'."
     },
     {
     "section": "TL;DR",
     "issue": "Fluff/Marketing Language",
     "evidence": "This revolutionary product will...",
     "suggestion": "Remove 'revolutionary' and state the product's function directly."
     }
     ]
4. System Action (Short Circuit): If the report is [], the client transitions to the "DONE" state and shows the final draft.
5. System Action (Heal/Refine): If the report has issues, the client immediately sends a new request to the API with (phase: "refine", draft: string, report: EvaluationReport).
6. Agent 4 (Refiner): The server executes the "Refiner" agent.
   - System Prompt: "You are an expert technical editor. Your task is to rewrite the provided PRD draft to fix all the issues listed in the JSON evaluation report. Do not add new sections. Do not change content that is not related to an issue. Produce a new, complete, and corrected version of the entire document."
   - User Prompt: Full Draft: \n\n (The full draft string) \n\n Issues to Fix: \n\n (The EvaluationReport JSON string)
7. System Action: The agent streams the new, corrected draft back to the client.
8. System Action (Loop): The client receives the new draft and loops back to step 1 of this phase (sending the new draft to the "evaluate" phase).
