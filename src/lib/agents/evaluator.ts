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
 * Zod schema for coherence analysis
 */
const CoherenceAnalysisSchema = z.object({
  crossReferenceAccuracy: z
    .boolean()
    .describe("Do all metrics, features, and goals align between sections?"),
  narrativeFlow: z
    .boolean()
    .describe(
      "Does the document tell a coherent story from problem to solution?"
    ),
  personaCoverage: z
    .boolean()
    .describe("Are all target personas consistently addressed throughout?"),
  traceability: z
    .boolean()
    .describe(
      "Can you trace problems → features → metrics in a logical chain?"
    ),
  issues: z
    .array(
      z.object({
        section: z.string().describe("Specific section where issue occurs"),
        description: z
          .string()
          .describe("Clear explanation of the coherence problem"),
        suggestion: z.string().describe("Specific fix recommendation"),
        severity: z.enum(["error", "warn"]).describe("Issue severity level"),
      })
    )
    .describe("List of coherence issues found"),
});

/**
 * Zod schema for quality assessment
 */
const QualityAnalysisSchema = z.object({
  toneAndVoice: z
    .boolean()
    .describe(
      "Is the language professional, direct, and confidence-inspiring?"
    ),
  specificity: z
    .boolean()
    .describe("Are claims backed by concrete numbers, timelines, and sources?"),
  clarity: z
    .boolean()
    .describe("Would a busy executive understand the key points in 2 minutes?"),
  conciseness: z
    .boolean()
    .describe("Is every sentence adding value or just filling space?"),
  issues: z
    .array(
      z.object({
        section: z.string().describe("Specific section where issue occurs"),
        description: z
          .string()
          .describe("Clear explanation of the quality problem"),
        suggestion: z.string().describe("Specific improvement recommendation"),
        severity: z.enum(["error", "warn"]).describe("Issue severity level"),
      })
    )
    .describe("List of quality issues found"),
});

/**
 * Zod schema for realism validation
 */
const RealismAnalysisSchema = z.object({
  timelinePlausibility: z
    .boolean()
    .describe("Are adoption estimates realistic for enterprise environments?"),
  technicalFeasibility: z
    .boolean()
    .describe("Do proposed features align with current browser capabilities?"),
  marketUnderstanding: z
    .boolean()
    .describe("Do competitive claims reflect actual market positioning?"),
  resourceRequirements: z
    .boolean()
    .describe("Are implementation expectations achievable?"),
  issues: z
    .array(
      z.object({
        section: z.string().describe("Specific section where issue occurs"),
        description: z
          .string()
          .describe("Clear explanation of the realism concern"),
        suggestion: z.string().describe("Specific feasibility improvement"),
        severity: z.enum(["error", "warn"]).describe("Issue severity level"),
      })
    )
    .describe("List of realism issues found"),
});

/**
 * Complete semantic evaluation schema
 */
const SemanticEvaluationSchema = z.object({
  coherence: CoherenceAnalysisSchema.describe(
    "Analysis of logical consistency across sections"
  ),
  quality: QualityAnalysisSchema.describe(
    "Assessment of executive readiness and clarity"
  ),
  realism: RealismAnalysisSchema.describe(
    "Validation of practical feasibility"
  ),
  overallAssessment: z
    .object({
      isPublicationReady: z
        .boolean()
        .describe("Would this document pass rigorous executive review?"),
      criticalIssues: z
        .number()
        .describe("Number of critical issues that block publication"),
      improvementNeeded: z
        .boolean()
        .describe("Does the document need significant improvement?"),
    })
    .describe("Overall document assessment"),
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
  const issues: SemanticIssue[] = [];

  // Add coherence issues
  for (const [index, issue] of evaluation.coherence.issues.entries()) {
    issues.push({
      id: `coherence-${index}`,
      itemId: "semantic-evaluator",
      type: "coherence",
      severity: issue.severity,
      section: issue.section,
      message: issue.description,
      suggestion: issue.suggestion,
      evidence: issue.section,
      hints: [issue.suggestion],
    });
  }

  // Add quality issues
  for (const [index, issue] of evaluation.quality.issues.entries()) {
    issues.push({
      id: `quality-${index}`,
      itemId: "semantic-evaluator",
      type: "quality",
      severity: issue.severity,
      section: issue.section,
      message: issue.description,
      suggestion: issue.suggestion,
      evidence: issue.section,
      hints: [issue.suggestion],
    });
  }

  // Add realism issues
  for (const [index, issue] of evaluation.realism.issues.entries()) {
    issues.push({
      id: `realism-${index}`,
      itemId: "semantic-evaluator",
      type: "realism",
      severity: issue.severity,
      section: issue.section,
      message: issue.description,
      suggestion: issue.suggestion,
      evidence: issue.section,
      hints: [issue.suggestion],
    });
  }

  return issues;
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
