import { z } from "zod";

import { getResilientAI } from "@/lib/ai/resilient";

import { loadEvaluatorPrompt, loadStyleGuide } from "./promptLoader";
import type { EvaluationIssue, EvaluationReport } from "./types";

const evaluationSchema = z.array(
  z.object({
    section: z.string().min(1),
    issue: z.string().min(1),
    evidence: z.string().optional(),
    suggestion: z.string().optional(),
  })
);

type EvaluationSchema = z.infer<typeof evaluationSchema>;

export async function runEvaluatorAgent(
  draft: string
): Promise<EvaluationReport> {
  const ai = getResilientAI();
  const [systemPrompt, styleGuide] = await Promise.all([
    loadEvaluatorPrompt(),
    loadStyleGuide(),
  ]);

  const { object } = await ai.generateObjectWithFallback<EvaluationSchema>({
    prompt: [
      systemPrompt,
      "Style & Principles Guide:",
      styleGuide.trim(),
      "Draft to evaluate:",
      draft.trim(),
    ].join("\n\n"),
    schema: evaluationSchema,
  });

  return object.map<EvaluationIssue>((issue) => ({
    section: issue.section.trim(),
    issue: issue.issue.trim(),
    evidence: issue.evidence?.trim() ?? undefined,
    suggestion: issue.suggestion?.trim() ?? undefined,
  }));
}
