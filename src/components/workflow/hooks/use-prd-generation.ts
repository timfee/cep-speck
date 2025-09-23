import { useCallback } from "react";

import { getProgressForPhase } from "@/lib/spec/helpers/phase-processing";
import type { StructuredWorkflowState } from "@/types/workflow";

import {
  usePrdGenerationActions,
  usePrdGenerationState,
} from "./prd-generation-context";

import { executeGeneration } from "./prd-generation-executor";

export function usePrdGeneration(
  onGenerationComplete?: (generatedPrd: string) => void
) {
  const state = usePrdGenerationState();
  const {
    beginGeneration,
    completeGeneration,
    failGeneration,
    finishGeneration,
    resetGeneration,
    applyRefinedDraft,
    clearError,
    setOnCompleteCallback,
    setPhase,
    setProgress,
    setAttempt,
    setGeneratedPrd,
    setValidationIssues,
    updatePhaseStatus,
    recordPhaseIssues,
  } = usePrdGenerationActions();

  if (onGenerationComplete) {
    setOnCompleteCallback(onGenerationComplete);
  }

  const setPhaseWithProgress = useCallback(
    (nextPhase: string) => {
      setPhase(nextPhase);
      setProgress(getProgressForPhase(nextPhase));
    },
    [setPhase, setProgress]
  );

  const generatePrd = useCallback(
    async (workflowState: StructuredWorkflowState) => {
      await executeGeneration({
        workflowState,
        setPhaseWithProgress,
        setAttempt,
        setGeneratedPrd,
        completeGeneration,
        setValidationIssues,
        updatePhaseStatus,
        recordPhaseIssues,
        beginGeneration,
        failGeneration,
        finishGeneration,
      });
    },
    [
      beginGeneration,
      completeGeneration,
      failGeneration,
      finishGeneration,
      recordPhaseIssues,
      setAttempt,
      setGeneratedPrd,
      setPhaseWithProgress,
      setValidationIssues,
      updatePhaseStatus,
    ]
  );

  return {
    ...state,
    generatePrd,
    resetGeneration,
    applyRefinedDraft,
    setGenerationError: failGeneration,
    clearGenerationError: clearError,
  };
}
