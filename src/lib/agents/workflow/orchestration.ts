/**
 * Workflow orchestration utilities
 */

import type { GenerationLoopContext } from "./types";

import {
  createPhaseFrame,
  createResultFrame,
  encodeStreamFrame,
} from "../../spec/streaming";

import type { Issue } from "../../spec/types";

/**
 * Create initial workflow state
 */
export function createWorkflowState() {
  return {
    attempt: 0,
    finalDraft: "",
    totalTokens: 0,
  };
}

/**
 * Update workflow state with results from a single attempt
 */
export function updateWorkflowState(
  state: { attempt: number; finalDraft: string; totalTokens: number },
  result: { draft: string; totalTokens: number; shouldContinue: boolean }
) {
  state.finalDraft = result.draft;
  state.totalTokens = result.totalTokens;
}

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

/**
 * Finish workflow successfully
 */
export function finishSuccessfully(
  context: GenerationLoopContext,
  attempt: number,
  draft: string
) {
  const totalDuration = Date.now() - context.startTime;

  sendSuccessNotification(context, attempt);
  sendSuccessResult(context, draft, attempt, totalDuration);
}

/**
 * Finish workflow with failure
 */
export function finishWithFailure(
  context: GenerationLoopContext,
  attempt: number,
  draft: string,
  allIssues: Issue[]
) {
  const totalDuration = Date.now() - context.startTime;

  sendFailureNotification(context, attempt, allIssues);
  sendFailureResult(context, draft, attempt, totalDuration);
}

/**
 * Handle workflow errors gracefully
 */
export function handleWorkflowError(
  context: GenerationLoopContext,
  attempt: number,
  finalDraft: string,
  error: unknown
) {
  const totalDuration = Date.now() - context.startTime;
  const errorMessage = error instanceof Error ? error.message : String(error);

  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("failed", attempt, `Workflow error: ${errorMessage}`)
    )
  );
  context.safeEnqueue(
    encodeStreamFrame(
      createResultFrame(false, finalDraft || "", attempt, totalDuration)
    )
  );
}

function sendSuccessNotification(
  context: GenerationLoopContext,
  attempt: number
) {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("done", attempt, "Content generation complete")
    )
  );
}

function sendSuccessResult(
  context: GenerationLoopContext,
  draft: string,
  attempt: number,
  totalDuration: number
) {
  context.safeEnqueue(
    encodeStreamFrame(createResultFrame(true, draft, attempt, totalDuration))
  );
}

function sendFailureNotification(
  context: GenerationLoopContext,
  attempt: number,
  allIssues: Issue[]
) {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "failed",
        attempt,
        `Validation failed with ${allIssues.length} issues`
      )
    )
  );
}

function sendFailureResult(
  context: GenerationLoopContext,
  draft: string,
  attempt: number,
  totalDuration: number
) {
  context.safeEnqueue(
    encodeStreamFrame(createResultFrame(false, draft, attempt, totalDuration))
  );
}
