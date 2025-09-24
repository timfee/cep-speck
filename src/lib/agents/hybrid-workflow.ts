/**
 * Hybrid Drafter→Linter→Evaluator→Refiner workflow implementation
 *
 * This implements the complete hybrid agentic workflow orchestrating:
 * - Drafter: AI generation with mega-prompt + existing toPrompt functions
 * - Linter: Existing deterministic validate functions
 * - Evaluator: AI semantic analysis
 * - Refiner: AI healing replacement
 */


import { executeDraftPhase } from "./workflow/draft";

import {
  createWorkflowState,
  updateWorkflowState,
  processValidationResult,
  handleRefinementPhase,
  handleWorkflowError,
} from "./workflow/orchestration";

import { runRefinement } from "./workflow/refinement";
import type { GenerationLoopContext } from "./workflow/types";
import { runValidationAndEvaluation } from "./workflow/validation";

/**
 * Run the hybrid Drafter→Linter→Evaluator→Refiner workflow
 */
export async function runGenerationLoop(
  context: GenerationLoopContext
): Promise<void> {
  const state = createWorkflowState();
  let currentDraft: string | null = null;

  while (state.attempt < context.maxAttempts) {
    state.attempt++;

    const result = await executeWorkflowAttempt(context, state, currentDraft);
    if (!result.success) break;
    if (!result.shouldContinue) break;

    // Store the current draft for potential validation in the next iteration
    currentDraft = result.draft ?? null;
  }
}

/**
 * Execute a single workflow attempt with error handling
 */
async function executeWorkflowAttempt(
  context: GenerationLoopContext,
  state: { attempt: number; finalDraft: string; totalTokens: number },
  existingDraft?: string | null
): Promise<{ success: boolean; shouldContinue: boolean; draft?: string }> {
  try {
    const result = await runSingleAttempt(
      context,
      state.attempt,
      state.totalTokens,
      existingDraft
    );
    updateWorkflowState(state, result);
    return {
      success: true,
      shouldContinue: result.shouldContinue,
      draft: result.draft,
    };
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
  totalTokens: number,
  existingDraft?: string | null
): Promise<{ draft: string; totalTokens: number; shouldContinue: boolean }> {
  let draft: string;
  let updatedTokens: number;

  // If we have an existing draft (from refinement), validate it directly
  // Otherwise, generate a new draft
  if (existingDraft !== null && existingDraft !== undefined) {
    draft = existingDraft;
    updatedTokens = totalTokens;
  } else {
    const draftResult = await executeDraftPhase(context, attempt, totalTokens);
    draft = draftResult.draft;
    updatedTokens = draftResult.updatedTokens;
  }

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
