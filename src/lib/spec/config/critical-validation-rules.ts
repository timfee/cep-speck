/**
 * Critical validation requirements block for system prompt generation.
 * These rules provide upstream guidance to reduce validation churn
 * and improve first-pass PRD quality.
 */
export const CRITICAL_VALIDATION_REQUIREMENTS = `

CRITICAL VALIDATION REQUIREMENTS:

1. CONSISTENCY ACROSS SECTIONS:
   - Every metric mentioned in TL;DR must match EXACTLY with Success Metrics section
   - Every persona in key_personas must appear in People Problems, Goals, and CUJs
   - Features must trace back to specific People Problems
   - No orphaned requirements or metrics

2. TECHNICAL REALISM:
   - Adoption rates must follow realistic curves (typically 10-20% in month 1, 40-60% by month 3)
   - Never claim 100% of anything involving human behavior
   - Implementation timelines must account for engineering, testing, and rollout phases
   - Performance improvements must cite baseline measurements

3. PLACEHOLDER SPECIFICITY:
   - Every placeholder must specify: what data, units, timeframe, and source
   - Bad: [PM_INPUT_NEEDED: metric]
   - Good: [PM_INPUT_NEEDED: baseline median time to first security policy deployment in minutes from CBCM telemetry]

4. SKU DIFFERENTIATION:
   - Every feature must explicitly state: Core, Premium, or Both
   - Premium features must include why they're premium (complexity, cost, advanced use case)
   - Core features in Premium PRDs must explain the upgrade path

5. QUANTIFICATION REQUIREMENTS:
   - Replace "reduce significantly" with "reduce by X%" with baseline
   - Replace "many admins" with "X% of admins" or "N admins in sample of M"
   - Replace "faster" with "Xms faster" or "X% reduction in time"
   - Never use "up to" without also providing typical/median values

6. DEPENDENCY VALIDATION:
   - Every dependency must be bidirectional (if A depends on B, B's timeline must support A)
   - External dependencies need fallback plans
   - Critical path items must be explicitly marked

7. TESTABILITY REQUIREMENTS:
   - Each functional requirement must include acceptance criteria
   - Metrics must specify data collection method
   - Success criteria must be binary (pass/fail) determinable
`;
