/**
 * Semantic Evaluator Agent - Layer 2 AI semantic quality analysis
 *
 * Performs semantic analysis that deterministic rules cannot catch,
 * focusing on coherence, realism, clarity, and executive readiness.
 */

import { getResilientAI } from "@/lib/ai/resilient";

import type { SemanticIssue } from "./evaluator-helpers";
import { convertToSemanticIssues, createErrorIssue } from "./evaluator-helpers";
import { loadPrompt } from "./prompt-loader";
import { SemanticEvaluationSchema } from "./schemas";

/**
 * Run semantic evaluation on a PRD draft
 *
 * @param draft - The PRD content to evaluate
 * @returns Promise resolving to array of semantic issues found
 *
 * @example
 * ```typescript
 * const issues = await runSemanticEvaluator(draftContent);
 * console.log(`Found ${issues.length} semantic issues`);
 * ```
 */
export async function runSemanticEvaluator(
  draft: string
): Promise<SemanticIssue[]> {
  try {
    const evaluatorPrompt = await loadPrompt({
      path: "guides/prompts/semantic-evaluator.md",
      cache: true,
      fallback:
        "Analyze this PRD for semantic quality, coherence, and realism issues.",
    });

    const analysisPrompt = `${evaluatorPrompt}

## Document to Evaluate

${draft}

## Instructions

Analyze the above PRD document and return a structured evaluation covering coherence, quality, and realism. Focus on semantic issues that deterministic rules cannot catch. Provide specific, actionable suggestions for each issue found.`;

    const resilientAI = getResilientAI();
    const { object: evaluation } = await resilientAI.generateObjectWithFallback(
      {
        prompt: analysisPrompt,
        schema: SemanticEvaluationSchema,
      }
    );

    return convertToSemanticIssues(evaluation);
  } catch (error) {
    console.error("Semantic evaluator failed:", error);
    return [createErrorIssue(error)];
  }
}
