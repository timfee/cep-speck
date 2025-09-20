1.0 System Core
1.1. Core Objective: The system shall accept high-level, unstructured user ideas (a "brief") and manage a multi-stage, agentic workflow to produce a comprehensive, validated Product Requirements Document (PRD).
1.2. Core Philosophy: The system architecture must prioritize minimal indirection and low cognitive load. Modularity shall be achieved through distinct, self-contained agents or "phases" in a chain, not through a complex programmatic registry of micro-validators.
1.3. User Interface: The system shall provide a single, clean, and reactive web-based interface that guides the user through the generation workflow.

2.0 Phase 1: Input & Outlining
2.1. Unstructured Input: The system shall present the user with a simple text-entry mechanism to capture their initial, unstructured PRD thoughts (the "brief").
2.2. Outline Generation:
The system shall pass the user's brief to a "PRD Outliner" agent.
This agent's sole responsibility is to analyze the brief and generate a structured outline of a PRD.
The outline shall be returned as a structured object (e.g., JSON) representing the key sections (e.g., "Executive Summary," "Problems," "Goals," "Functional Requirements," "Success Metrics," "Annexes").
2.3. Outline Tweak & Editing:
The UI shall render the generated outline in a user-friendly, editable format (e.g., a list of section headers).
The user must be able to add new sections, delete suggested sections, and re-order sections.
The user must be able to add high-level notes or bullet points under each section header to provide further context for the next phase.
2.4. State Management: The system shall maintain the user's tweaked outline as the new "structured state" for the PRD.

3.0 Phase 2: Draft Generation
3.1. Generation Trigger: The user shall be able to trigger the draft generation phase after confirming the structured outline.
3.2. Generation Agent:
The system shall pass the entire structured state (the outline with user notes) to a "PRD Draft-Writer" agent.
This agent is responsible for writing the full, unabridged first draft of the PRD, respecting the user's specified section order and notes.
3.3. Integrated RAG (Knowledge):
The generation agent must have access to a local knowledge base (e.g., files in a /knowledge directory).
The system shall perform retrieval-augmented generation (RAG) to find and inject relevant context from this knowledge base into the generation prompt.
This is used for internal context, team principles, existing product info, etc.
3.4. Integrated Web Search (Research):
The generation agent must have the capability to perform web searches.
If the user's brief or outline mentions competitors or requires market data, the agent must perform these searches during generation to find and cite current information (e.g., "Web search for features of competitors X, Y, and Z").
3.5. Streaming Output: The system shall stream the generated draft back to the UI token-by-token to provide immediate feedback.
3.6. Finalize Draft: Upon completion, the system holds the full draft in memory for the next phase.

4.0 Phase 3: Iterative Refinement Loop
4.1. Loop Trigger: This phase shall begin automatically after Phase 2 (Draft Generation) is complete.
4.2. Self-Evaluation (Self-Eval):
The system shall pass the full draft to a "PRD Self-Evaluator" agent.
This agent's prompt will contain a "Style & Steering Guide" (see separate file).
The agent's responsibility is to critique the draft against the guide, not to fix it.
It must return a structured "Evaluation Report" (e.g., JSON) listing only the issues found (e.g., [{ "section": "Success Metrics", "issue": "Metric 'user happiness' is vague", "fix_suggestion": "Replace with a quantifiable metric like 'Task Completion Rate' or 'Reduction in support tickets'." }]).
If no issues are found, it shall return an empty list.
4.3. Short Circuit (Finalize):
If the "Evaluation Report" is empty, the loop is complete.
The system shall present the final, validated draft to the user.
4.4. Refinement (Heal/Refine):
If the "Evaluation Report" contains issues, the system shall pass both the full draft and the "Evaluation Report" to a "PRD Refinement" agent.
This agent's responsibility is to fix all the issues listed in the report by generating a new version of the full PRD draft.
4.5. Loop Continuation: The new draft from the Refinement agent becomes the input for step 4.2 (Self-Evaluation). The loop repeats until the "Evaluation Report" is empty or a maximum iteration limit (e.g., 5) is reached.
4.6. Finalization (Max Attempts): If the loop hits the maximum iteration limit, the system shall present the last available draft to the user, along with the final "Evaluation Report" to show what issues remain.

5.0 Non-Functional Requirements
5.1. State: The system must be stateless from the server's perspective. The full state of the PRD (outline, draft, etc.) shall be maintained on the client.
5.2. Performance: All LLM agent calls (Outline, Draft, Eval, Refine) must stream responses where applicable to keep the UI responsive.
5.3. Modularity: Agent responsibilities must be clearly separated. The "Outliner" agent must not write drafts. The "Draft-Writer" must not self-evaluate. The "Evaluator" must not write new drafts.
5.4. Configuration: The prompts for the "PRD Outliner," "PRD Draft-Writer," "PRD Self-Evaluator," and "PRD Refinement" agents must be stored externally (e.g., in .md or config files) and loaded at runtime, not hard-coded.
