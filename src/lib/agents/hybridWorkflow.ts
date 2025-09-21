/**
 * Hybrid Drafter→Linter→Evaluator→Refiner workflow implementation
 *
 * This implements the complete hybrid agentic workflow orchestrating:
 * - Drafter: AI generation with mega-prompt + existing toPrompt functions
 * - Linter: Existing deterministic validate functions
 * - Evaluator: AI semantic analysis
 * - Refiner: AI healing replacement
 */

import {
  createWorkflowState,
  updateWorkflowState,
  processValidationResult,
  handleRefinementPhase,
  handleWorkflowError,
} from "./workflow/orchestration";

import {
  executeDraftPhase,
  runValidationAndEvaluation,
  runRefinement,
} from "./workflow/phases";

import type { GenerationLoopContext } from "./workflow/types";

/**
 * Run the hybrid Drafter→Linter→Evaluator→Refiner workflow
 */
export async function runGenerationLoop(
  context: GenerationLoopContext
): Promise<void> {
  const state = createWorkflowState();

  while (state.attempt < context.maxAttempts) {
    state.attempt++;

    const result = await executeWorkflowAttempt(context, state);
    if (!result.success) break;
    if (!result.shouldContinue) break;
  }
}

/**
 * Execute a single workflow attempt with error handling
 */
async function executeWorkflowAttempt(
  context: GenerationLoopContext,
  state: { attempt: number; finalDraft: string; totalTokens: number }
): Promise<{ success: boolean; shouldContinue: boolean }> {
  try {
    const result = await runSingleAttempt(
      context,
      state.attempt,
      state.totalTokens
    );
    updateWorkflowState(state, result);
    return { success: true, shouldContinue: result.shouldContinue };
  } catch (error) {
    handleWorkflowError(context, state.attempt, state.finalDraft, error);
    return { success: false, shouldContinue: false };
  }
}

/**
 * Run a single attempt of the workflow
 */
async function runSingleAttempt(
  context: GenerationLoopContext,
  attempt: number,
  totalTokens: number
): Promise<{ draft: string; totalTokens: number; shouldContinue: boolean }> {
  const { draft, updatedTokens } = await executeDraftPhase(
    context,
    attempt,
    totalTokens
  );
  const validationResult = await runValidationAndEvaluation(
    context,
    attempt,
    draft
  );

  return processValidationResult(
    context,
    attempt,
    draft,
    validationResult,
    updatedTokens,
    (ctx, att, dft, issues, tokens) =>
      handleRefinementPhase(ctx, att, dft, issues, tokens, runRefinement)
  );
}

export type { GenerationLoopContext };
