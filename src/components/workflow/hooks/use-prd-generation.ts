/**
 * Enhanced PRD generation with progress tracking and validation feedback
 * Addresses BLOCKER 4: Missing Workflow Integration
 */

import { useCallback } from "react";

import { serializeWorkflowToSpec } from "@/lib/serializers/workflow-to-spec";
import { getProgressForPhase } from "@/lib/streaming/stream-processor";
import type { StructuredWorkflowState } from "@/types/workflow";

import {
  createGenerationStreamHandler,
  getGenerationRequestOptions,
  normalizeGenerationError,
} from "./prd-generation-helpers";

import { runGenerationRequest } from "./prd-generation-runner";
import { usePrdGenerationStore } from "./use-prd-generation-store";

export function usePrdGeneration(
  onGenerationComplete?: (generatedPrd: string) => void
) {
  const {
    state,
    actions: {
      beginGeneration,
      completeGeneration,
      failGeneration,
      finishGeneration,
      resetGeneration,
      setPhase,
      setProgress,
      setAttempt,
      setGeneratedPrd,
      setValidationIssues,
    },
  } = usePrdGenerationStore(onGenerationComplete);

  const setPhaseWithProgress = useCallback(
    (nextPhase: string) => {
      setPhase(nextPhase);
      setProgress(getProgressForPhase(nextPhase));
    },
    [setPhase, setProgress]
  );

  const generatePrd = useCallback(
    async (workflowState: StructuredWorkflowState) => {
      beginGeneration();

      try {
        const specText = serializeWorkflowToSpec(workflowState);
        const frameHandler = createGenerationStreamHandler({
          setPhaseWithProgress,
          setAttempt,
          setGeneratedPrd,
          completeGeneration,
          setValidationIssues,
        });

        await runGenerationRequest(
          specText,
          frameHandler,
          getGenerationRequestOptions()
        );
      } catch (error) {
        failGeneration(normalizeGenerationError(error));
      } finally {
        finishGeneration();
      }
    },
    [
      beginGeneration,
      completeGeneration,
      failGeneration,
      finishGeneration,
      setAttempt,
      setGeneratedPrd,
      setPhaseWithProgress,
      setValidationIssues,
    ]
  );

  return {
    ...state,
    generatePrd,
    resetGeneration,
  };
}
