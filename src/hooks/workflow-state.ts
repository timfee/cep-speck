/**
 * Workflow state management utilities
 */

import { useCallback } from "react";

import type {
  ContentOutline,
  EnterpriseParameters,
  StructuredWorkflowState,
  WorkflowProgress,
  WorkflowStep,
} from "@/types/workflow";

import { WORKFLOW_STEPS } from "@/types/workflow";

// Get step IDs for easier manipulation
const STEP_IDS = WORKFLOW_STEPS.map((step) => step.id) as WorkflowStep[];

/**
 * Calculate workflow progress
 */
export function calculateProgress(
  currentStep: WorkflowStep,
  completedSteps: WorkflowStep[]
): WorkflowProgress {
  const totalSteps = STEP_IDS.length;
  const completedCount = completedSteps.length;
  const currentStepIndex = STEP_IDS.indexOf(currentStep);

  return {
    step: currentStepIndex + 1,
    totalSteps,
    stepName: currentStep,
    completion: Math.round((completedCount / totalSteps) * 100),
    canGoBack: currentStepIndex > 0,
    canGoNext: currentStepIndex < totalSteps - 1,
  };
}

/**
 * Check if step can be navigated to
 */
export function canNavigateToStep(
  targetStep: WorkflowStep,
  completedSteps: WorkflowStep[]
): boolean {
  const targetIndex = STEP_IDS.indexOf(targetStep);
  const maxAllowedIndex = Math.max(0, completedSteps.length);
  return targetIndex <= maxAllowedIndex;
}

/**
 * State setter hooks
 */
export function useWorkflowSetters(
  setState: (
    updater: (prev: StructuredWorkflowState) => StructuredWorkflowState
  ) => void
) {
  const setInitialPrompt = useCallback(
    (prompt: string) => {
      setState((prev) => ({ ...prev, initialPrompt: prompt }));
    },
    [setState]
  );

  const setContentOutline = useCallback(
    (outline: ContentOutline) => {
      setState((prev) => ({ ...prev, contentOutline: outline }));
    },
    [setState]
  );

  const setEnterpriseParameters = useCallback(
    (parameters: EnterpriseParameters) => {
      setState((prev) => ({ ...prev, enterpriseParameters: parameters }));
    },
    [setState]
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      setState((prev) => ({ ...prev, isLoading: loading }));
    },
    [setState]
  );

  const setError = useCallback(
    (error?: string) => {
      setState((prev) => ({ ...prev, error }));
    },
    [setState]
  );

  return {
    setInitialPrompt,
    setContentOutline,
    setEnterpriseParameters,
    setLoading,
    setError,
  };
}

export type WorkflowSetters = ReturnType<typeof useWorkflowSetters>;
