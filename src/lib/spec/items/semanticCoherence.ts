// src/lib/spec/items/semanticCoherence.ts
import { generateObject } from "ai";
import { z } from "zod";

import { geminiModel } from "@/lib/ai/provider";

import { PATTERNS, extractSection, voidUnused } from "../helpers";

import type { Issue } from "../types";

export const itemId = "semantic-coherence";
export type Params = {
  personas: string[];
};

// Define the schema for the AI to check
const CoherenceSchema = z.object({
  tldrMetricsMatch: z.boolean().describe("Do all metric values in the TL;DR *exactly* match the values in the Success Metrics section?"),
  tldrFeatureCoverage: z.boolean().describe("Does the TL;DR summary mention at least half of the core features listed in Functional Requirements?"),
  personaCoverage: z.boolean().describe("Are all required personas (IT Admin, End User, Security Team) mentioned in the 'People Problems', 'Goals', and 'CUJs' sections?"),
  traceability: z.boolean().describe("Does every People Problem seem to map to a Feature, and does every Feature seem to have a relevant Success Metric?"),
  reasoning: z.string().describe("Briefly explain any 'false' ratings.")
});

function toPrompt(params: Params, _pack?: unknown): string {
  voidUnused(_pack);
  return `Ensure document is semantically coherent:
1. Metrics in TL;DR must exactly match Success Metrics.
2. TL;DR must summarize the key features.
3. Personas (${params.personas.join(', ')}) must be covered in Problems, Goals, and CUJs.
4. All Problems must trace to Features, and all Features to Metrics.`;
}

async function validate(draft: string, params: Params, _pack?: unknown): Promise<Issue[]> {
  voidUnused(_pack);
  const issues: Issue[] = [];
  
  // Extract relevant sections for the AI to make its job easier (less context)
  const tldr = extractSection(draft, PATTERNS.TLDR_SECTION);
  const problems = extractSection(draft, PATTERNS.PEOPLE_PROBLEMS_SECTION);
  const goals = extractSection(draft, PATTERNS.GOALS_SECTION);
  const cujs = extractSection(draft, PATTERNS.CUJS_SECTION);
  const features = extractSection(draft, /# 6\. Functional Requirements[\s\S]*?(?=# 7\.|$)/);
  const metrics = extractSection(draft, PATTERNS.SUCCESS_METRICS_SECTION);

  if (!tldr || !problems || !features || !metrics) {
    // If key sections are missing, that's a `sectionCount` problem, not a coherence problem.
    return []; 
  }

  const prompt = `Analyze the semantic coherence of this PRD.
Required Personas: ${params.personas.join(', ')}

---TL;DR---
${tldr}
---PEOPLE PROBLEMS---
${problems}
---GOALS---
${goals}
---CUJS---
${cujs}
---FUNCTIONAL REQUIREMENTS---
${features}
---SUCCESS METRICS---
${metrics}
---END SECTIONS---

Based on the sections above, validate the following rules and provide your reasoning.`;

  try {
    const { object } = await generateObject({
      model: geminiModel(),
      prompt,
      schema: CoherenceSchema,
    });

    if (!object.tldrMetricsMatch) {
      issues.push({
        id: "metric-inconsistency",
        itemId,
        severity: "error",
        message: "Metrics in TL;DR do not match Success Metrics.",
        evidence: object.reasoning,
      });
    }
    if (!object.tldrFeatureCoverage) {
      issues.push({
        id: "tldr-feature-mismatch",
        itemId,
        severity: "warn",
        message: "TL;DR does not adequately summarize core features.",
        evidence: object.reasoning,
      });
    }
    if (!object.personaCoverage) {
      issues.push({
        id: "missing-persona-coverage",
        itemId,
        severity: "error",
        message: "A required persona is missing from a key section.",
        evidence: object.reasoning,
      });
    }
    if (!object.traceability) {
      issues.push({
        id: "traceability-gap",
        itemId,
        severity: "error",
        message: "A Problem, Feature, or Metric is orphaned.",
        evidence: object.reasoning,
      });
    }
    
    return issues;

  } catch (error) {
    console.warn("SemanticCoherence AI validation failed:", error);
    return [{
        id: "ai-validator-failed",
        itemId,
        severity: "warn",
        message: "Semantic coherence check could not be performed.",
        evidence: error instanceof Error ? error.message : String(error)
    }];
  }
}

async function heal(
  issues: Issue[],
  _params: Params,
  _pack?: unknown
): Promise<string | null> {
  voidUnused(_params, _pack);
  if (!issues.length) return null;
  
  const healingPrompts: string[] = [];
  if (issues.some(i => i.id === 'metric-inconsistency')) {
    healingPrompts.push("1. Align metric values in the TL;DR to *exactly* match the values in Success Metrics.");
  }
  if (issues.some(i => i.id === 'tldr-feature-mismatch')) {
    healingPrompts.push("2. Update the TL;DR to mention the most important features from Functional Requirements.");
  }
  if (issues.some(i => i.id === 'missing-persona-coverage')) {
    healingPrompts.push("3. Ensure all personas (IT Admin, End User, Security Team) are explicitly mentioned in People Problems, Goals, and CUJs.");
  }
  if (issues.some(i => i.id === 'traceability-gap')) {
    healingPrompts.push("4. Fix traceability: ensure every Problem is addressed by a Feature, and every Feature has a supporting Metric.");
  }

  if (healingPrompts.length === 0) return null;
  
  return `Revise the draft to fix coherence issues:\n${healingPrompts.join("\n")}`;
}

export const itemModule = { itemId, toPrompt, validate, heal };