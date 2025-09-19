import { z } from "zod";

import { getResilientAI } from "@/lib/ai/resilient";

import { PATTERNS, extractSection, voidUnused } from "../helpers";

import type { Issue, SpecPack } from "../types";

export const itemId = "semantic-policy-validator";
export type Params = {
  personas: string[];
  enforceFactualTone: boolean;
  requireSpecificMetrics: boolean;
  banOverExplanation: boolean;
};

// Constants
const MAX_EVIDENCE_ITEMS = 3;

// 1. Define schemas from other validators
const CoherenceSchema = z.object({
  tldrMetricsMatch: z.boolean().describe("Do all metric values in the TL;DR *exactly* match the values in the Success Metrics section?"),
  tldrFeatureCoverage: z.boolean().describe("Does the TL;DR summary mention at least half of the core features listed in Functional Requirements?"),
  personaCoverage: z.boolean().describe("Are all required personas mentioned in the 'People Problems', 'Goals', and 'CUJs' sections?"),
  traceability: z.boolean().describe("Does every People Problem seem to map to a Feature, and does every Feature seem to have a relevant Success Metric?"),
  reasoning: z.string().describe("Briefly explain any 'false' ratings."),
});

const QualitySchema = z.object({
  isExecutiveQuality: z.boolean().describe("Overall assessment if the tone is executive-ready, factual, and concise."),
  factualToneIssues: z.array(z.string()).describe("List of specific phrases that are vague, hedging, or empty business-speak (e.g., 'might', 'could', 'some', 'strengthen our position')."),
  metricIssues: z.array(z.string()).describe("List of metrics or numbers that lack specific units, timeframes, or sources."),
  overExplanationIssues: z.array(z.string()).describe("List of phrases that are meta-commentary or over-explanation (e.g., 'as mentioned', 'it is important to note')."),
  reasoning: z.string().describe("Brief (1-2 sentence) summary of the quality issues found."),
});

const RealismSchema = z.object({
  isRealistic: z.boolean().describe("Are the adoption/migration timelines and percentages plausible for an enterprise product?"),
  unrealisticClaims: z.array(z.string()).describe("List of specific claims that seem unrealistic (e.g., '90% adoption in 1 week')."),
  reasoning: z.string().describe("Briefly explain why the claims are or are not realistic."),
});

// 2. Create the single merged schema
const MegaValidationSchema = z.object({
  coherence: CoherenceSchema.describe("Validation of document consistency, traceability, and coverage."),
  quality: QualitySchema.describe("Validation of executive tone, clarity, and metric specificity."),
  realism: RealismSchema.describe("Validation of adoption timelines and technical feasibility."),
});

// 3. toPrompt is a simple combination
export function toPrompt(params: Params, pack?: SpecPack): string {
  voidUnused(pack);
  return `Ensure document is semantically coherent, high-quality, and realistic.

- Coherence: Metrics must match, summary must cover features, personas (${params.personas.join(', ')}) must be covered, and traceability must be complete.
- Quality: Tone must be factual, metrics specific, and language concise.
- Realism: Adoption claims must be plausible for an enterprise context.`;
}

// 4. validate function makes ONE AI call
export async function validate(draft: string, params: Params, pack?: SpecPack): Promise<Issue[]> {
  voidUnused(pack);
  const issues: Issue[] = [];

  // Extract sections for a focused prompt
  const tldr = extractSection(draft, PATTERNS.TLDR_SECTION);
  const problems = extractSection(draft, PATTERNS.PEOPLE_PROBLEMS_SECTION);
  const goals = extractSection(draft, PATTERNS.GOALS_SECTION);
  const cujs = extractSection(draft, PATTERNS.CUJS_SECTION);
  const features = extractSection(draft, /# 6\. Functional Requirements[\s\S]*?(?=# 7\.|$)/);
  const metrics = extractSection(draft, PATTERNS.SUCCESS_METRICS_SECTION);

  // If key sections are missing, that's a structure problem, not a semantic problem
  if (!tldr || !problems || !features || !metrics) {
    return [];
  }

  const prompt = `Analyze this PRD for semantic quality, coherence, and realism.
Required Personas: ${params.personas.join(', ')}

---TL;DR---
${tldr}
---PEOPLE PROBLEMS---
${problems}
---GOALS---
${goals || 'Not provided'}
---CUJS---
${cujs || 'Not provided'}
---FUNCTIONAL REQUIREMENTS---
${features}
---SUCCESS METRICS---
${metrics}
---END SECTIONS---

Validate all coherence, quality, and realism rules in one pass.`;

  try {
    const resilientAI = getResilientAI();
    const { object } = await resilientAI.generateObjectWithFallback({
      prompt,
      schema: MegaValidationSchema,
    });

    // 5. Map the single response back to granular issues
    // Coherence issues
    if (!object.coherence.tldrMetricsMatch) {
      issues.push({ 
        id: "metric-inconsistency", 
        itemId, 
        severity: "error", 
        message: "Metrics in TL;DR do not match Success Metrics.",
        evidence: object.coherence.reasoning,
      });
    }
    if (!object.coherence.tldrFeatureCoverage) {
      issues.push({
        id: "tldr-feature-mismatch",
        itemId,
        severity: "warn",
        message: "TL;DR does not adequately summarize core features.",
        evidence: object.coherence.reasoning,
      });
    }
    if (!object.coherence.personaCoverage) {
      issues.push({ 
        id: "missing-persona-coverage", 
        itemId, 
        severity: "error", 
        message: "A required persona is missing from a key section.",
        evidence: object.coherence.reasoning,
      });
    }
    if (!object.coherence.traceability) {
      issues.push({ 
        id: "traceability-gap", 
        itemId, 
        severity: "error", 
        message: "A Problem, Feature, or Metric is orphaned.",
        evidence: object.coherence.reasoning,
      });
    }

    // Quality issues
    if (!object.quality.isExecutiveQuality) {
      const evidence = [...object.quality.factualToneIssues, ...object.quality.metricIssues, ...object.quality.overExplanationIssues]
        .slice(0, MAX_EVIDENCE_ITEMS)
        .join(", ");
      issues.push({ 
        id: "executive-quality-issue", 
        itemId, 
        severity: "warn", 
        message: "AI detected vague language or non-specific metrics.", 
        evidence,
      });
    }

    // Handle specific quality sub-issues
    if (params.enforceFactualTone && object.quality.factualToneIssues.length > 0) {
      issues.push({
        id: "vague-or-hedging-language",
        itemId,
        severity: "warn",
        message: `AI detected vague/hedging language: ${object.quality.reasoning}`,
        evidence: object.quality.factualToneIssues.slice(0, MAX_EVIDENCE_ITEMS).join(", "),
      });
    }

    if (params.requireSpecificMetrics && object.quality.metricIssues.length > 0) {
      issues.push({
        id: "metrics-not-specific",
        itemId,
        severity: "error",
        message: `AI detected non-specific metrics: ${object.quality.reasoning}`,
        evidence: object.quality.metricIssues.slice(0, MAX_EVIDENCE_ITEMS).join(", "),
      });
    }

    if (params.banOverExplanation && object.quality.overExplanationIssues.length > 0) {
      issues.push({
        id: "over-explanation",
        itemId,
        severity: "warn",
        message: `AI detected over-explanation/meta-commentary: ${object.quality.reasoning}`,
        evidence: object.quality.overExplanationIssues.slice(0, MAX_EVIDENCE_ITEMS).join(", "),
      });
    }

    // Realism issues
    if (!object.realism.isRealistic) {
      issues.push({ 
        id: "unrealistic-adoption", 
        itemId, 
        severity: "warn", 
        message: "AI detected unrealistic adoption/migration claims.", 
        evidence: object.realism.unrealisticClaims.join(", "),
      });
    }
    
    return issues;

  } catch (error) {
    console.warn("Mega-Validator AI call failed:", error);
    return [{ 
      id: "ai-validator-failed", 
      itemId, 
      severity: "warn", 
      message: "Semantic validation AI call failed.", 
      evidence: (error as Error).message,
    }];
  }
}

// 6. Heal function aggregates all healing instructions
export async function heal(issues: Issue[], params?: Params, pack?: SpecPack): Promise<string | null> {
  voidUnused(params, pack);
  if (!issues.length) return null;

  const healingPrompts: string[] = [];
  if (issues.some(i => i.id.includes('metric-inconsistency'))) {
    healingPrompts.push("- Align metric values in TL;DR to *exactly* match Success Metrics.");
  }
  if (issues.some(i => i.id.includes('tldr-feature-mismatch'))) {
    healingPrompts.push("- Update the TL;DR to mention the most important features from Functional Requirements.");
  }
  if (issues.some(i => i.id.includes('missing-persona-coverage'))) {
    healingPrompts.push("- Add missing persona mentions (IT Admin, End User, Security Team) to Problems, Goals, or CUJs.");
  }
  if (issues.some(i => i.id.includes('traceability-gap'))) {
    healingPrompts.push("- Fix traceability: ensure every Problem maps to a Feature, and every Feature has a Metric.");
  }
  if (issues.some(i => i.id.includes('executive-quality-issue') || i.id.includes('vague-or-hedging-language'))) {
    healingPrompts.push("- Replace vague quantifiers with specific numbers and remove hedging language.");
  }
  if (issues.some(i => i.id.includes('metrics-not-specific'))) {
    healingPrompts.push("- Ensure all metrics have units, timeframes, and sources.");
  }
  if (issues.some(i => i.id.includes('over-explanation'))) {
    healingPrompts.push("- Remove meta-commentary and over-explanation phrases.");
  }
  if (issues.some(i => i.id.includes('unrealistic-adoption'))) {
    healingPrompts.push("- Adjust adoption timelines to be more conservative for an enterprise rollout.");
  }

  return healingPrompts.length > 0 ? `Revise the draft to fix semantic issues:\n${healingPrompts.join("\n")}` : null;
}

export const itemModule = { itemId, toPrompt, validate, heal };