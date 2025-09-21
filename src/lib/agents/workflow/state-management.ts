/**
 * Workflow state management utilities
 */

export interface WorkflowState {
  attempt: number;
  finalDraft: string;
  totalTokens: number;
}

/**
 * Create initial workflow state
 */
export function createWorkflowState(): WorkflowState {
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
  state: WorkflowState,
  result: { draft: string; totalTokens: number; shouldContinue: boolean }
) {
  state.finalDraft = result.draft;
  state.totalTokens = result.totalTokens;
}
