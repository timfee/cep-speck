import { z } from "zod";

import { getResilientAI } from "@/lib/ai/resilient";

import {
  areRequiredSectionsPresent,
  buildAnalysisPrompt,
  createCoherenceIssues,
  createQualityIssues,
  createRealismIssues,
  extractKeyPrdSections,
} from "../helpers";

import type { Issue, SpecPack } from "../types";

export const itemId = "semantic-policy-validator";
export type Params = {
  personas: string[];
  enforceFactualTone: boolean;
  requireSpecificMetrics: boolean;
  banOverExplanation: boolean;
};

// 1. Define schemas from other validators
const CoherenceSchema = z.object({
  tldrMetricsMatch: z
    .boolean()
    .describe(
      "Do all metric values in the TL;DR *exactly* match the values in the Success Metrics section?"
    ),
  tldrFeatureCoverage: z
    .boolean()
    .describe(
      "Does the TL;DR summary mention at least half of the core features listed in Functional Requirements?"
    ),
  personaCoverage: z
    .boolean()
    .describe(
      "Are all required personas mentioned in the 'People Problems', 'Goals', and 'CUJs' sections?"
    ),
  traceability: z
    .boolean()
    .describe(
      "Does every People Problem seem to map to a Feature, and does every Feature seem to have a relevant Success Metric?"
    ),
  reasoning: z.string().describe("Briefly explain any 'false' ratings."),
});

const QualitySchema = z.object({
  isExecutiveQuality: z
    .boolean()
    .describe(
      "Overall assessment if the tone is executive-ready, factual, and concise."
    ),
  factualToneIssues: z
    .array(z.string())
    .describe(
      "List of specific phrases that are vague, hedging, or empty business-speak (e.g., 'might', 'could', 'some', 'strengthen our position')."
    ),
  metricIssues: z
    .array(z.string())
    .describe(
      "List of metrics or numbers that lack specific units, timeframes, or sources."
    ),
  overExplanationIssues: z
    .array(z.string())
    .describe(
      "List of phrases that are meta-commentary or over-explanation (e.g., 'as mentioned', 'it is important to note')."
    ),
  reasoning: z
    .string()
    .describe("Brief (1-2 sentence) summary of the quality issues found."),
});

const RealismSchema = z.object({
  isRealistic: z
    .boolean()
    .describe(
      "Are the adoption/migration timelines and percentages plausible for an enterprise product?"
    ),
  unrealisticClaims: z
    .array(z.string())
    .describe(
      "List of specific claims that seem unrealistic (e.g., '90% adoption in 1 week')."
    ),
  reasoning: z
    .string()
    .describe("Briefly explain why the claims are or are not realistic."),
});

// 2. Create the single merged schema
const MegaValidationSchema = z.object({
  coherence: CoherenceSchema.describe(
    "Validation of document consistency, traceability, and coverage."
  ),
  quality: QualitySchema.describe(
    "Validation of executive tone, clarity, and metric specificity."
  ),
  realism: RealismSchema.describe(
    "Validation of adoption timelines and technical feasibility."
  ),
});

// 3. toPrompt is a simple combination
export function toPrompt(params: Params, _pack?: SpecPack): string {
  return `Ensure document is semantically coherent, high-quality, and realistic.

- Coherence: Metrics must match, summary must cover features, personas (${params.personas.join(", ")}) must be covered, and traceability must be complete.
- Quality: Tone must be factual, metrics specific, and language concise.
- Realism: Adoption claims must be plausible for an enterprise context.`;
}

// 4. validate function makes ONE AI call
export async function validate(
  draft: string,
  params: Params,
  _pack?: SpecPack
): Promise<Issue[]> {
  // Extract sections for a focused prompt
  const sections = extractKeyPrdSections(draft);

  // If key sections are missing, that's a structure problem, not a semantic problem
  if (!areRequiredSectionsPresent(sections)) {
    return [];
  }

  const prompt = buildAnalysisPrompt(sections, params.personas);

  try {
    const resilientAI = getResilientAI();
    const { object } = await resilientAI.generateObjectWithFallback({
      prompt,
      schema: MegaValidationSchema,
    });

    // Map the single response back to granular issues
    const issues: Issue[] = [];

    // Add coherence issues
    issues.push(...createCoherenceIssues(object.coherence, itemId));

    // Add quality issues
    issues.push(...createQualityIssues(object.quality, params, itemId));

    // Add realism issues
    issues.push(...createRealismIssues(object.realism, itemId));

    return issues;
  } catch (error) {
    console.warn("Mega-Validator AI call failed:", error);
    return [
      {
        id: "ai-validator-failed",
        itemId,
        severity: "warn",
        message: "Semantic validation AI call failed.",
        evidence: (error as Error).message,
      },
    ];
  }
}

export const itemModule = { itemId, toPrompt, validate };
