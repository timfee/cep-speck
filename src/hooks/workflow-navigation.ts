/**
 * Workflow navigation utilities
 */

import { useCallback } from "react";

import type { StructuredWorkflowState, WorkflowStep } from "@/types/workflow";
import { WORKFLOW_STEPS } from "@/types/workflow";

import type { WorkflowStateSetter } from "./workflow-state";

// Get step IDs for easier manipulation
const STEP_IDS = WORKFLOW_STEPS.map((step) => step.id) as WorkflowStep[];

/**
 * Navigation helper functions
 */
export function canNavigateNext(canGoNext: boolean): boolean {
  return canGoNext;
}

export function canNavigateBack(canGoBack: boolean): boolean {
  return canGoBack;
}

export function findNextStep(currentStep: WorkflowStep): WorkflowStep | null {
  const currentIndex = STEP_IDS.indexOf(currentStep);
  if (currentIndex >= 0 && currentIndex < STEP_IDS.length - 1) {
    return STEP_IDS[currentIndex + 1];
  }
  return null;
}

export function findPreviousStep(
  currentStep: WorkflowStep
): WorkflowStep | null {
  const currentIndex = STEP_IDS.indexOf(currentStep);
  if (currentIndex > 0) {
    return STEP_IDS[currentIndex - 1];
  }
  return null;
}

/**
 * Navigation hooks
 */
export function useWorkflowNavigation(
  state: StructuredWorkflowState,
  setState: WorkflowStateSetter,
  initialState: StructuredWorkflowState
) {
  const goToNextStep = useCallback(() => {
    if (!canNavigateNext(state.progress.canGoNext)) return;

    const nextStep = findNextStep(state.currentStep);
    if (nextStep) {
      setState((prev) => ({ ...prev, currentStep: nextStep }));
    }
  }, [state.progress.canGoNext, state.currentStep, setState]);

  const goToPreviousStep = useCallback(() => {
    if (!canNavigateBack(state.progress.canGoBack)) return;

    const previousStep = findPreviousStep(state.currentStep);
    if (previousStep) {
      setState((prev) => ({ ...prev, currentStep: previousStep }));
    }
  }, [state.progress.canGoBack, state.currentStep, setState]);

  const goToStep = useCallback(
    (targetStep: WorkflowStep) => {
      setState((prev) => ({ ...prev, currentStep: targetStep }));
    },
    [setState]
  );

  const resetWorkflow = useCallback(() => {
    setState(initialState);
  }, [setState, initialState]);

  return {
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetWorkflow,
  };
}
