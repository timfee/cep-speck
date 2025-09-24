import { useMemo } from "react";

import { calculateStepProgress } from "@/lib/utils/progress-calculation";

import type {
  StructuredWorkflowState,
  WorkflowProgress,
} from "@/types/workflow";


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
