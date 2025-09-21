/**
 * Semantic Evaluator Agent - Layer 2 AI semantic quality analysis
 *
 * Performs semantic analysis that deterministic rules cannot catch,
 * focusing on coherence, realism, clarity, and executive readiness.
 */

import { z } from "zod";

import { getResilientAI } from "@/lib/ai/resilient";
import type { Issue } from "@/lib/spec/types";

import { loadPrompt } from "./prompt-loader";

/**
 * Semantic issue interface extending the base Issue type
 */
export interface SemanticIssue extends Issue {
  /** Type of semantic issue */
  type: "coherence" | "quality" | "realism";
  /** Specific section where the issue occurs */
  section: string;
  /** Actionable suggestion for fixing the issue */
  suggestion: string;
}

/**
 * Common issue schema used across all evaluation types
 */
const IssueSchema = z.object({
  section: z.string().describe("Specific section where issue occurs"),
  description: z.string().describe("Clear explanation of the problem"),
  suggestion: z.string().describe("Specific fix recommendation"),
  severity: z.enum(["error", "warn"]).describe("Issue severity level"),
});

/**
 * Base analysis schema with common boolean checks and issues array
 */
const createAnalysisSchema = (checks: Record<string, string>) =>
  z.object({
    ...Object.fromEntries(
      Object.entries(checks).map(([key, desc]) => [
        key,
        z.boolean().describe(desc),
      ])
    ),
    issues: z.array(IssueSchema).describe("List of issues found"),
  });

/**
 * Complete semantic evaluation schema
 */
const SemanticEvaluationSchema = z.object({
  coherence: createAnalysisSchema({
    crossReferenceAccuracy:
      "Do all metrics, features, and goals align between sections?",
    narrativeFlow:
      "Does the document tell a coherent story from problem to solution?",
    personaCoverage:
      "Are all target personas consistently addressed throughout?",
    traceability:
      "Can you trace problems → features → metrics in a logical chain?",
  }),
  quality: createAnalysisSchema({
    toneAndVoice:
      "Is the language professional, direct, and confidence-inspiring?",
    specificity:
      "Are claims backed by concrete numbers, timelines, and sources?",
    clarity: "Would a busy executive understand the key points in 2 minutes?",
    conciseness: "Is every sentence adding value or just filling space?",
  }),
  realism: createAnalysisSchema({
    timelinePlausibility:
      "Are adoption estimates realistic for enterprise environments?",
    technicalFeasibility:
      "Do proposed features align with current browser capabilities?",
    marketUnderstanding:
      "Do competitive claims reflect actual market positioning?",
    resourceRequirements: "Are implementation expectations achievable?",
  }),
  overallAssessment: z.object({
    isPublicationReady: z
      .boolean()
      .describe("Would this document pass rigorous executive review?"),
    criticalIssues: z
      .number()
      .describe("Number of critical issues that block publication"),
    improvementNeeded: z
      .boolean()
      .describe("Does the document need significant improvement?"),
  }),
});

/**
 * Type for the semantic evaluation result
 */
type SemanticEvaluationResult = z.infer<typeof SemanticEvaluationSchema>;

/**
 * Convert evaluation result to SemanticIssue array
 */
function convertToSemanticIssues(
  evaluation: SemanticEvaluationResult
): SemanticIssue[] {
  const issueTypes: Array<{
    category: "coherence" | "quality" | "realism";
    issues: Array<{
      section: string;
      description: string;
      suggestion: string;
      severity: "error" | "warn";
    }>;
  }> = [
    { category: "coherence", issues: evaluation.coherence.issues },
    { category: "quality", issues: evaluation.quality.issues },
    { category: "realism", issues: evaluation.realism.issues },
  ];

  return issueTypes.flatMap(({ category, issues }) =>
    issues.map((issue, index) => ({
      id: `${category}-${index}`,
      itemId: "semantic-evaluator",
      type: category,
      severity: issue.severity,
      section: issue.section,
      message: issue.description,
      suggestion: issue.suggestion,
      evidence: issue.section,
      hints: [issue.suggestion],
    }))
  );
}

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
    // Load the semantic evaluator prompt
    const evaluatorPrompt = await loadPrompt({
      path: "guides/prompts/semantic-evaluator.md",
      cache: true,
      fallback:
        "Analyze this PRD for semantic quality, coherence, and realism issues.",
    });

    // Build the analysis prompt
    const analysisPrompt = `${evaluatorPrompt}

## Document to Evaluate

${draft}

## Instructions

Analyze the above PRD document and return a structured evaluation covering coherence, quality, and realism. Focus on semantic issues that deterministic rules cannot catch. Provide specific, actionable suggestions for each issue found.`;

    // Get resilient AI instance
    const resilientAI = getResilientAI();

    // Generate structured evaluation
    const { object: evaluation } = await resilientAI.generateObjectWithFallback(
      {
        prompt: analysisPrompt,
        schema: SemanticEvaluationSchema,
      }
    );

    // Convert to SemanticIssue array
    const issues = convertToSemanticIssues(evaluation);

    return issues;
  } catch (error) {
    console.error("Semantic evaluator failed:", error);

    // Return a single error issue rather than throwing
    return [
      {
        id: "evaluator-error",
        itemId: "semantic-evaluator",
        type: "quality",
        severity: "error",
        section: "system",
        message: `Semantic evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
        suggestion: "Check AI service availability and try again",
        evidence: "semantic-evaluator",
        hints: ["Verify API key configuration", "Check network connectivity"],
      },
    ];
  }
}
