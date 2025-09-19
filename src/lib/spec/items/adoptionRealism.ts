import { generateObject } from "ai";
import { z } from "zod";

import { geminiModel } from "@/lib/ai/provider";

import { voidUnused } from "../helpers";

import type { Issue } from "../types";

export const itemId = "adoption-realism";
export type Params = Record<string, never>;

const RealismSchema = z.object({
  isRealistic: z.boolean().describe("Are the adoption/migration timelines and percentages plausible for an enterprise product?"),
  unrealisticClaims: z.array(z.string()).describe("List of specific claims that seem unrealistic (e.g., '90% adoption in 1 week')."),
  reasoning: z.string().describe("Briefly explain why the claims are or are not realistic.")
});

function toPrompt(_params: Params, _pack?: unknown): string {
  voidUnused(_params, _pack);
  return "Adoption rates must be realistic for an enterprise context; avoid claims like 90% adoption in 2 weeks without strong justification.";
}

async function validate(draft: string, _params: Params, _pack?: unknown): Promise<Issue[]> {
  voidUnused(_params, _pack);
  const issues: Issue[] = [];
  
  // Find metrics/goals to check
  const metricsSection = draft.match(/# 8\. Success Metrics[\s\S]*?(?=# 9\.|$)/)?.[0] ?? "";
  const goalsSection = draft.match(/# 4\. Goals[\s\S]*?(?=# 5\.|$)/)?.[0] ?? "";
  
  const textToAnalyze = metricsSection + "\n" + goalsSection;
  if (textToAnalyze.trim().length === 0) return [];

  const prompt = `Analyze the following PRD goals and metrics for unrealistic adoption claims.
Enterprise adoption is typically slow. Claims like "90% adoption in 1 week" are unrealistic.
Claims like "50% adoption in 6 months" are more realistic.
Check all claims related to adoption, migration, or usage percentages over time.

---EXCERPT---
${textToAnalyze}
---END EXCERPT---`;

  try {
    const { object } = await generateObject({
      model: geminiModel(),
      prompt,
      schema: RealismSchema,
    });

    if (!object.isRealistic) {
      issues.push({
        id: "unrealistic-adoption",
        itemId,
        severity: "warn",
        message: `AI detected unrealistic adoption/migration claims: ${object.reasoning}`,
        evidence: object.unrealisticClaims.join(", "),
      });
    }
    return issues;

  } catch (error) {
    console.warn("AdoptionRealism AI validation failed:", error);
    return [];
  }
}

async function heal(
  issues: Issue[],
  _params: Params,
  _pack?: unknown
): Promise<string | null> {
  voidUnused(issues, _params, _pack);
  if (!issues.length) return null;
  return `Review adoption/migration timelines. Adjust percentages and timeframes to be more conservative and realistic for an enterprise rollout (e.g., target 50% adoption in 6 months, not 90% in 1 week).`;
}

export const itemModule = { itemId, toPrompt, validate, heal };