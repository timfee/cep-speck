import { useCallback } from "react";

import type { StructuredWorkflowState, WorkflowStep } from "@/types/workflow";

import {
  canNavigateBack,
  canNavigateNext,
  findNextStep,
  findPreviousStep,
} from "./navigation-state";

/**
 * Navigation functions for the workflow
 */
export function useWorkflowNavigation(
  state: StructuredWorkflowState,
  setState: (
    updater: (prev: StructuredWorkflowState) => StructuredWorkflowState
  ) => void,
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

    const prevStep = findPreviousStep(state.currentStep);
    if (prevStep) {
      setState((prev) => ({ ...prev, currentStep: prevStep }));
    }
  }, [state.progress.canGoBack, state.currentStep, setState]);

  const goToStep = useCallback(
    (step: WorkflowStep) => {
      setState((prev) => ({ ...prev, currentStep: step }));
    },
    [setState]
  );

  const resetWorkflow = useCallback(() => {
    setState(() => initialState);
  }, [setState, initialState]);

  return {
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetWorkflow,
  };
}
