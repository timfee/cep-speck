/**
 * Common healing instruction builders
 *
 * These utilities help create consistent and reusable healing instructions
 * across validation modules.
 */

import type { Issue } from "../types";

/**
 * Builder for creating consistent healing instructions
 */
export class HealingInstructionBuilder {
  private readonly instructions: string[] = [];

  /**
   * Add an instruction if a condition is met
   */
  addIf(condition: boolean, instruction: string): this {
    if (condition) {
      this.instructions.push(instruction);
    }
    return this;
  }

  /**
   * Add an instruction for specific issue types
   */
  addForIssue(issues: Issue[], issueId: string, instruction: string): this {
    if (issues.some((i) => i.id === issueId)) {
      this.instructions.push(instruction);
    }
    return this;
  }

  /**
   * Build the final healing instruction string
   */
  build(prefix?: string): string | null {
    if (this.instructions.length === 0) {
      return null;
    }

    const joined = this.instructions.join("; ");
    return (prefix ?? "").length > 0 ? `${prefix}: ${joined}.` : `${joined}.`;
  }
}

/**
 * Create a healing instruction builder
 */
export function createHealingBuilder(): HealingInstructionBuilder {
  return new HealingInstructionBuilder();
}

/**
 * Common healing instructions for specific patterns
 */
export const HEALING_TEMPLATES = {
  // Metric-related healing
  METRIC_UNITS:
    "Add units and timeframes to all metrics (%, ms, minutes, # users, etc.)",
  METRIC_SPECIFICITY:
    "Replace vague quantifiers with specific numbers, percentages, or ranges",
  METRIC_CONSISTENCY:
    "Align metric values between TL;DR and Success Metrics sections",

  // Content quality healing
  REDUCE_HEDGING:
    "State facts directly; use hedging only for genuine uncertainty",
  REMOVE_META_COMMENTARY:
    "Remove meta-commentary and explanatory phrases; state facts directly",
  IMPROVE_PLACEHOLDERS:
    "Make placeholders more specific by including units, timeframes, and data sources",

  // Structure healing
  HEADER_PATTERN: (pattern: string) =>
    `Conform section headers to the label pattern "${pattern}"`,
  SECTION_COUNT: (range: string, pattern: string) =>
    `Adjust the number of top-level sections to ${range}. Keep compliant sections; add or trim minimally. Maintain header pattern ${pattern}`,

  // Persona and traceability healing
  PERSONA_COVERAGE:
    "Ensure each persona appears in all required sections with explicit persona labels",
  TRACEABILITY:
    "Restore problem→feature→metric chain with explicit citations and measurable outcomes",

  // Text quality healing
  BANNED_TEXT:
    "Replace banned terms with precise CEP/Admin Console terminology appropriate to context",
  EXECUTIVE_PRECISION: "Enhance executive precision",
} as const;

/**
 * Helper to create metric-related healing instructions
 */
export function buildMetricHealing(
  issues: Issue[],
  params: { require: string[]; metricRegex: string }
): string | null {
  if (!issues.length) return null;

  const required = params.require.join(", ");
  return `For each metric line (pattern ${params.metricRegex}), add the missing attributes: ${required}. Use timeframe like "within 90 days of GA", explicit units, and name a Source of Truth (SoT). Do not rewrite unrelated content.`;
}

/**
 * Helper to create section consistency healing instructions
 */
export function buildConsistencyHealing(): string {
  return `Align metric values:
1. List each metric appearing in both TL;DR and Success Metrics.
2. For any differing value, prefer the more specific or numerically justified one.
3. Update the TL;DR for narrative brevity but keep numbers identical to Success Metrics.
4. Do NOT add new metrics just to force alignment; remove from TL;DR if not a tracked success metric.`;
}

/**
 * Helper to create traceability healing instructions
 */
export function buildTraceabilityHealing(): string {
  return `Restore problem→feature→metric chain:
1. For each People Problem bullet, cite it explicitly in at least one feature intro sentence.
2. For each feature, add at least one Success Metric referencing a distinctive keyword from the feature name.
3. If a problem is too broad for a single feature, split it and map each part.
4. If a feature is unmeasured, add a metric describing an observable behavioral or system outcome (latency, error rate, admin hours, security coverage).`;
}

/**
 * Helper to create persona coverage healing instructions
 */
export function buildPersonaHealing(): string {
  return `Ensure each persona appears in all required sections:
1. People Problems: tie at least one bullet per persona to a concrete pain.
2. Goals: include persona perspective (e.g., "IT Admin reduces...", "End User experiences...").
3. CUJs: write at least one journey per persona or annotate shared journeys with persona tags.
4. Avoid generic plural nouns; use explicit persona labels so automation can detect coverage.`;
}
