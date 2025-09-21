/**
 * Utility to convert SemanticIssue[] to Issue[] for unified handling
 *
 * This allows the hybrid workflow to combine deterministic validation issues
 * with semantic evaluation issues into a single array for the Refiner agent.
 */

import type { SemanticIssue } from "@/lib/agents/evaluator-helpers";
import type { Issue } from "@/lib/spec/types";

/**
 * Convert SemanticIssue array to standard Issue array format
 *
 * This enables unified handling of both deterministic validation issues
 * and semantic evaluation issues in the hybrid workflow.
 *
 * @param semanticIssues - Array of semantic issues from evaluator
 * @returns Standard Issue array for use with existing validation system
 */
export function convertSemanticIssuesToIssues(
  semanticIssues: SemanticIssue[]
): Issue[] {
  return semanticIssues.map((semanticIssue) => ({
    id: semanticIssue.id,
    itemId: semanticIssue.itemId,
    severity: semanticIssue.severity,
    message: semanticIssue.message,
    evidence: semanticIssue.evidence,
    hints: semanticIssue.hints,
  }));
}

/**
 * Combine deterministic validation issues with semantic evaluation issues
 *
 * @param deterministicIssues - Issues from existing validateAll function
 * @param semanticIssues - Issues from semantic evaluator agent
 * @returns Combined array of all issues for unified handling
 */
export function combineAllIssues(
  deterministicIssues: Issue[],
  semanticIssues: SemanticIssue[]
): Issue[] {
  const convertedSemanticIssues = convertSemanticIssuesToIssues(semanticIssues);
  return [...deterministicIssues, ...convertedSemanticIssues];
}
