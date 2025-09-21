/**
 * Helper functions for semantic evaluator
 */

import type { Issue } from "@/lib/spec/types";

import type { SemanticEvaluationResult } from "./schemas";

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
 * Convert evaluation result to SemanticIssue array
 */
export function convertToSemanticIssues(
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
 * Create error issue for failed evaluation
 */
export function createErrorIssue(error: unknown): SemanticIssue {
  return {
    id: "evaluator-error",
    itemId: "semantic-evaluator",
    type: "quality",
    severity: "error",
    section: "system",
    message: `Semantic evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
    suggestion: "Check AI service availability and try again",
    evidence: "semantic-evaluator",
    hints: ["Verify API key configuration", "Check network connectivity"],
  };
}
