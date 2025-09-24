/**
 * Workflow navigation utilities
 */

import { useCallback, useMemo } from "react";

import type { StructuredWorkflowState, WorkflowStep } from "@/types/workflow";
import { WORKFLOW_STEPS } from "@/types/workflow";

import type { WorkflowStateSetter } from "./workflow-state";

// Get step IDs for easier manipulation
const STEP_IDS = WORKFLOW_STEPS.map((step) => step.id) as WorkflowStep[];

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

export interface WorkflowNavigationGuards {
  nextStep: WorkflowStep | null;
  previousStep: WorkflowStep | null;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function resolveNavigationGuards(
  state: StructuredWorkflowState
): WorkflowNavigationGuards {
  const nextStep = findNextStep(state.currentStep);
  const previousStep = findPreviousStep(state.currentStep);

  return {
    nextStep,
    previousStep,
    canGoNext: Boolean(nextStep && state.progress.canGoNext),
    canGoBack: Boolean(previousStep && state.progress.canGoBack),
  };
}

export interface WorkflowNavigationService extends WorkflowNavigationGuards {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (targetStep: WorkflowStep) => void;
  resetWorkflow: () => void;
}

/**
 * Navigation hooks
 */
export function useWorkflowNavigation(
  state: StructuredWorkflowState,
  setState: WorkflowStateSetter,
  initialState: StructuredWorkflowState
) {
  const guards = useMemo(() => resolveNavigationGuards(state), [state]);

  const goToNextStep = useCallback(() => {
    if (!guards.canGoNext || !guards.nextStep) return;

    setState((prev) => ({
      ...prev,
      currentStep: guards.nextStep as WorkflowStep,
    }));
  }, [guards, setState]);

  const goToPreviousStep = useCallback(() => {
    if (!guards.canGoBack || !guards.previousStep) return;

    setState((prev) => ({
      ...prev,
      currentStep: guards.previousStep as WorkflowStep,
    }));
  }, [guards, setState]);

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
    ...guards,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetWorkflow,
  } satisfies WorkflowNavigationService;
}
