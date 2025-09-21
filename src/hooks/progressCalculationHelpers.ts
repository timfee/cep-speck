// Progress calculation helpers for structured workflow

import type {
  StructuredWorkflowState,
  WorkflowProgress,
} from "@/types/workflow";

import { WORKFLOW_STEPS } from "@/types/workflow";

export const MIN_PROMPT_LENGTH = 10;
export const PROMPT_COMPLETION_TARGET = 50;
const DRAFTING_PROGRESS = 25;
const EVALUATING_PROGRESS = 50;
const REFINEMENT_PROGRESS_INCREMENT = 10;
const REFINEMENT_PROGRESS_MAX = 90;

// Calculate step completion and navigation state
export function calculateStepProgress(
  state: StructuredWorkflowState
): WorkflowProgress {
  const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === state.currentStep);

  // Handle invalid step
  if (stepIndex === -1) {
    return {
      step: 1,
      totalSteps: WORKFLOW_STEPS.length,
      stepName: "Unknown",
      completion: 0,
      canGoBack: false,
      canGoNext: false,
    };
  }

  const stepInfo = WORKFLOW_STEPS[stepIndex];
  const { canGoNext, completion, statusLabel } = getStepCompletion(state);

  return {
    step: stepIndex + 1,
    totalSteps: WORKFLOW_STEPS.length,
    stepName: stepInfo.name,
    completion,
    canGoBack: stepIndex > 0,
    canGoNext,
    statusLabel,
  };
}

// Get completion status for current step
function getStepCompletion(state: StructuredWorkflowState): {
  canGoNext: boolean;
  completion: number;
  statusLabel?: string;
} {
  switch (state.currentStep) {
    case "idea":
      return getIdeaStepCompletion(state.brief);

    case "outline":
      return getOutlineStepCompletion(state.outline);

    case "generate":
      return getGenerateStepCompletion(state);

    case "complete":
      return { canGoNext: false, completion: 100, statusLabel: "Done" };

    default:
      return { canGoNext: false, completion: 0 };
  }
}

// Calculate idea step completion
function getIdeaStepCompletion(prompt: string): {
  canGoNext: boolean;
  completion: number;
  statusLabel?: string;
} {
  const canGoNext = prompt.trim().length > MIN_PROMPT_LENGTH;
  const completion = Math.min(
    100,
    (prompt.length / PROMPT_COMPLETION_TARGET) * 100
  );

  return {
    canGoNext,
    completion,
    statusLabel: canGoNext ? "Ready" : "Add more detail",
  };
}

// Calculate outline step completion
function getOutlineStepCompletion(
  outline: StructuredWorkflowState["outline"]
): {
  canGoNext: boolean;
  completion: number;
  statusLabel?: string;
} {
  const sections = outline?.sections ?? [];
  const canGoNext = sections.length > 0;

  return {
    canGoNext,
    completion: canGoNext ? 100 : 0,
    statusLabel: canGoNext
      ? `${sections.length} section${sections.length > 1 ? "s" : ""}`
      : "Awaiting outline",
  };
}

function getGenerateStepCompletion(state: StructuredWorkflowState): {
  canGoNext: boolean;
  completion: number;
  statusLabel?: string;
} {
  if (state.status === "generating") {
    return {
      canGoNext: false,
      completion: DRAFTING_PROGRESS,
      statusLabel: "Drafting",
    };
  }

  if (state.status === "evaluating") {
    return {
      canGoNext: false,
      completion: EVALUATING_PROGRESS,
      statusLabel: "Evaluating",
    };
  }

  if (state.status === "refining") {
    return {
      canGoNext: false,
      completion: Math.min(
        REFINEMENT_PROGRESS_MAX,
        EVALUATING_PROGRESS + state.iteration * REFINEMENT_PROGRESS_INCREMENT
      ),
      statusLabel: `Refinement ${state.iteration}`,
    };
  }

  const hasDraft = state.finalDraft.trim().length > 0;
  return {
    canGoNext: hasDraft,
    completion: hasDraft ? 100 : 0,
    statusLabel: hasDraft ? "Ready" : "Awaiting draft",
  };
}
