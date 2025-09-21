/**
 * Workflow orchestration utilities
 */

// Re-export focused utilities for clean organization
export { createWorkflowState, updateWorkflowState } from "./state-management";
export { finishSuccessfully, finishWithFailure } from "./completion-helpers";
export { handleWorkflowError } from "./error-handling";

import type { GenerationLoopContext } from "./types";
import type { Issue } from "../../spec/types";

/**
 * Process validation results and determine next action
 */
export async function processValidationResult(
  context: GenerationLoopContext,
  attempt: number,
  draft: string,
  validationResult: { allIssues: Issue[]; unifiedReport: { ok: boolean } },
  totalTokens: number,
  handleRefinementPhase: (
    context: GenerationLoopContext,
    attempt: number,
    draft: string,
    allIssues: Issue[],
    totalTokens: number
  ) => Promise<{ draft: string; totalTokens: number; shouldContinue: boolean }>
): Promise<{ draft: string; totalTokens: number; shouldContinue: boolean }> {
  const { finishSuccessfully } = await import("./completion-helpers");

  if (validationResult.unifiedReport.ok) {
    finishSuccessfully(context, attempt, draft);
    return { draft, totalTokens, shouldContinue: false };
  }

  return await handleRefinementPhase(
    context,
    attempt,
    draft,
    validationResult.allIssues,
    totalTokens
  );
}

/**
 * Handle the refinement phase when issues are found
 */
export async function handleRefinementPhase(
  context: GenerationLoopContext,
  attempt: number,
  draft: string,
  allIssues: Issue[],
  totalTokens: number,
  runRefinement: (
    context: GenerationLoopContext,
    attempt: number,
    draft: string,
    allIssues: Issue[],
    totalTokens: number
  ) => Promise<{ draft: string; updatedTokens: number }>
): Promise<{ draft: string; totalTokens: number; shouldContinue: boolean }> {
  const { finishWithFailure } = await import("./completion-helpers");

  if (attempt < context.maxAttempts) {
    const { draft: refinedDraft, updatedTokens } = await runRefinement(
      context,
      attempt,
      draft,
      allIssues,
      totalTokens
    );
    return {
      draft: refinedDraft,
      totalTokens: updatedTokens,
      shouldContinue: true,
    };
  } else {
    finishWithFailure(context, attempt, draft, allIssues);
    return { draft, totalTokens, shouldContinue: false };
  }
}
