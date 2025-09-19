import { generateObject } from "ai";
import { z } from "zod";

import { geminiModel } from "@/lib/ai/provider";

import { voidUnused } from "../helpers";

import type { Issue } from "../types";

export const itemId = "executive-quality";
export type Params = {
  enforceFactualTone: boolean;
  requireSpecificMetrics: boolean;
  banOverExplanation: boolean;
};

// Schema for the AI to fill
const QualityCheckSchema = z.object({
  isExecutiveQuality: z.boolean().describe("Overall assessment if the tone is executive-ready, factual, and concise."),
  factualToneIssues: z.array(z.string()).describe("List of specific phrases that are vague, hedging, or empty business-speak (e.g., 'might', 'could', 'some', 'strengthen our position')."),
  metricIssues: z.array(z.string()).describe("List of metrics or numbers that lack specific units, timeframes, or sources."),
  overExplanationIssues: z.array(z.string()).describe("List of phrases that are meta-commentary or over-explanation (e.g., 'as mentioned', 'it is important to note')."),
  reasoning: z.string().describe("Brief (1-2 sentence) summary of the quality issues found.")
});

// Constants
const TLDR_MAX_LENGTH = 1500;
const MAX_EVIDENCE_ITEMS = 3;

function toPrompt(_params: Params, _pack?: unknown): string {
  voidUnused(_params, _pack);
  return `Write with executive precision: factual statements, specific metrics with units and timeframes, direct language. Avoid sensationalist claims, empty business speak, or meta-commentary.`;
}

async function validate(draft: string, params: Params, _pack?: unknown): Promise<Issue[]> {
  voidUnused(_pack);
  const issues: Issue[] = [];

  // If no params are enabled, skip the check.
  if (!params.enforceFactualTone && !params.requireSpecificMetrics && !params.banOverExplanation) {
    return issues;
  }

  const tldr = draft.match(/# 1\. TL;DR[\s\S]*?(?=# 2\.|$)/)?.[0] ?? draft.substring(0, TLDR_MAX_LENGTH);

  const prompt = `Analyze the executive quality of the following PRD excerpt.
Focus on:
1.  Factual Tone: Is it direct and factual, or does it use vague quantifiers, hedging, or empty business-speak?
2.  Specific Metrics: Are metrics specific? Do they include units and context?
3.  Conciseness: Does it avoid over-explanation and meta-commentary like "as noted above" or "it is important to note"?

Return your analysis in the specified JSON format.

---DRAFT EXCERPT---
${tldr}
---END EXCERPT---`;

  try {
    const { object } = await generateObject({
      model: geminiModel(), // Using the base model provider
      prompt,
      schema: QualityCheckSchema,
    });

    if (object.isExecutiveQuality) {
      return issues; // AI confirms quality is high
    }

    // Map AI findings back to our Issue format
    if (params.enforceFactualTone && object.factualToneIssues.length > 0) {
      issues.push({
        id: "vague-or-hedging-language",
        itemId,
        severity: "warn",
        message: `AI detected vague/hedging language: ${object.reasoning}`,
        evidence: object.factualToneIssues.slice(0, MAX_EVIDENCE_ITEMS).join(", "),
      });
    }

    if (params.requireSpecificMetrics && object.metricIssues.length > 0) {
      issues.push({
        id: "metrics-not-specific",
        itemId,
        severity: "error",
        message: `AI detected non-specific metrics: ${object.reasoning}`,
        evidence: object.metricIssues.slice(0, MAX_EVIDENCE_ITEMS).join(", "),
      });
    }

    if (params.banOverExplanation && object.overExplanationIssues.length > 0) {
      issues.push({
        id: "over-explanation",
        itemId,
        severity: "warn",
        message: `AI detected over-explanation/meta-commentary: ${object.reasoning}`,
        evidence: object.overExplanationIssues.slice(0, MAX_EVIDENCE_ITEMS).join(", "),
      });
    }
    
    return issues;

  } catch (error) {
    console.warn("ExecutiveQuality AI validation failed:", error);
    // Fail open: If the AI check fails, return no issues for this validator.
    // The deterministic checks will still run.
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
async function heal(
  issues: Issue[],
  _params: Params,
  _pack?: unknown
): Promise<string | null> {
  voidUnused(_params, _pack);
  if (!issues.length) return null;

  // The healing instructions can now be simpler and more direct
  return `Enhance executive precision:
- Replace vague quantifiers (e.g., "some", "many") with specific numbers.
- State facts directly; remove hedging language (e.g., "might", "could") where possible.
- Remove meta-commentary (e.g., "it is important to note").
- Ensure all metrics have units and timeframes.`;
}

export const itemModule = { itemId, toPrompt, validate, heal };