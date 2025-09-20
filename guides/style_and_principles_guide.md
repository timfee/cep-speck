# Style and Principles Guide

This guide steers the EvaluatorAgent and serves as the architectural style guide for the code itself.

## 1. Architectural Principles (For the LLM building the system)
- Single Responsibility Principle (SRP) for Agents: Each agent (Outliner, Drafter, Evaluator, Refiner) must have one job. The Evaluator only finds issues. The Refiner only fixes them.
- Minimal Indirection: Do not create complex programmatic abstractions, registries, or factories. The system's "logic" lives in the prompts for the agents, not in layers of TypeScript code.
- Data Contracts: Communication between phases must be via simple, serializable data (string or JSON).
- Client-Side State: The server is stateless. The client is responsible for holding the current brief, outline, and draft, and for orchestrating the multi-step flow.
- Configuration over Code: All prompts for agents and this style guide must be external files loaded at runtime, not hard-coded strings. This allows for rapid iteration of the system's "logic" without redeploying.

## 2. PRD Content Principles (For the EvaluatorAgent)
Your task is to find and report violations of these principles.
- P1: No Fluff (Factual & Concise)
  - VIOLATION: Remove all marketing language and vague claims.
  - Bad: "a revolutionary, world-class product to streamline workflows"
  - Good: "a tool to reduce admin configuration time by X%"
  - VIOLATION: Remove filler words. "It is important to note that..." -> "..."
- P2: Quantify Everything (No Vague Metrics)
  - VIOLATION: Metrics must be quantifiable.
  - Bad: "Improve user satisfaction."
  - Good: "Increase task completion rate for 'create new policy' from 60% to 90%."
  - Bad: "Reduce setup time significantly."
  - Good: "Reduce median setup time from 45 minutes (baseline) to 10 minutes (target) within Q1."
  - VIOLATION: Metrics must specify a timeframe and source of truth (SoT).
  - Bad: "Increase adoption."
  - Good: "Achieve 40% MAU (Monthly Active Users) of licensed seats by H2, as measured by CBCM telemetry."
- P3: No "Quality Theater" Metrics
  - VIOLATION: Do not use vague, game-able metrics.
  - Bad: "NPS", "Net Promoter Score", "Happiness Index", "User Engagement Score".
  - Good: "Daily Active Users (DAU)", "Task Completion Rate", "Error Rate", "Reduction in support tickets for topic X".
- P4: Traceability
  - VIOLATION: A functional requirement has no clear link to a user problem.
  - VIOLATION: A success metric does not measure a stated goal or functional requirement.
  - VIOLATION: A user problem is stated but never addressed by a feature.
- P5: Technical Realism
  - VIOLATION: Any claim of "100%" involving human behavior (e.g., "100% adoption," "100% compliance").
  - VIOLATION: Any percentage over 100% (e.g., "200% increase").
  - VIOLATION: Unrealistic adoption timelines (e.g., "90% adoption in week 1"). Enterprise adoption is slow.
- P6: Specific Placeholders
  - VIOLATION: Placeholders are vague.
  - Bad: [PM_INPUT_NEEDED: metric]
  - Good: [PM_INPUT_NEEDED: baseline median time (in seconds) for page load from Looker dashboard X]
- P7: SKU Differentiation
  - VIOLATION: A functional requirement does not state its target SKU.
  - Must include: "Target SKU: Core" or "Target SKU: Premium".
  - VIOLATION: A "Core" feature is listed in a "Premium" PRD without justification.
  - Must include: A rationale for why it's in the PRD (e.g., "This Core feature provides the baseline telemetry required for the Premium 'Advanced Reporting' feature.").
- P8: Citations
  - VIOLATION: A factual claim about the market or a competitor is made without a corresponding footnote or source.