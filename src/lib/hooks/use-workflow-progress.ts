import { useMemo } from "react";

import type {
  StructuredWorkflowState,
  WorkflowProgress,
} from "@/types/workflow";

import { calculateStepProgress } from "./progress-calculation";

export function useWorkflowStateWithProgress(
  state: StructuredWorkflowState
): StructuredWorkflowState & { progress: WorkflowProgress } {
  const progress = useMemo(() => calculateStepProgress(state), [state]);

  return useMemo(
    () => ({
      ...state,
      progress,
    }),
    [state, progress]
  );
}
