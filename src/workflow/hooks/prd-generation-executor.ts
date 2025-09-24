import {
  serializeWorkflowToLegacySpecText,
  serializeWorkflowToSpec,
} from "@/lib/serializers/workflow-to-spec";

import { serializeWorkflowToOutlinePayload } from "@/lib/serializers/workflow-to-structured-outline";
import type { Issue, StreamPhase } from "@/lib/spec/types";
import type { StructuredWorkflowState } from "@/types/workflow";

import {
  createGenerationStreamHandler,
  getGenerationRequestOptions,
  normalizeGenerationError,
} from "./prd-generation-helpers";

import { runGenerationRequest } from "./prd-generation-runner";

interface ExecuteGenerationParams {
  workflowState: StructuredWorkflowState;
  setPhaseWithProgress: (phase: string) => void;
  setAttempt: (value: number) => void;
  setGeneratedPrd: (draft: string) => void;
  completeGeneration: (draft: string) => void;
  setValidationIssues: (issues: Issue[]) => void;
  updatePhaseStatus: (
    phase: StreamPhase,
    attempt: number | undefined,
    message?: string
  ) => void;
  recordPhaseIssues: (phase: StreamPhase, issues: Issue[]) => void;
  beginGeneration: () => void;
  failGeneration: (message: string) => void;
  finishGeneration: () => void;
}

export async function executeGeneration({
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
}: ExecuteGenerationParams) {
  beginGeneration();

  try {
    const frameHandler = createGenerationStreamHandler({
      setPhaseWithProgress,
      setAttempt,
      setGeneratedPrd,
      completeGeneration,
      setValidationIssues,
      updatePhaseStatus,
      recordPhaseIssues,
    });

    await runGenerationRequest(
      {
        structuredSpec: serializeWorkflowToSpec(workflowState),
        legacySpecText: serializeWorkflowToLegacySpecText(workflowState),
        outlinePayload: serializeWorkflowToOutlinePayload(workflowState),
      },
      frameHandler,
      getGenerationRequestOptions()
    );
  } catch (error) {
    failGeneration(normalizeGenerationError(error));
  } finally {
    finishGeneration();
  }
}
