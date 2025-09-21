// Progress calculation helpers for structured workflow

import type {
  StructuredWorkflowState,
  WorkflowProgress,
} from "@/types/workflow";

import { WORKFLOW_STEPS } from "@/types/workflow";

export const MIN_PROMPT_LENGTH = 10;
export const PROMPT_COMPLETION_TARGET = 50;

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
  const { canGoNext, completion } = getStepCompletion(state);

  return {
    step: stepIndex + 1,
    totalSteps: WORKFLOW_STEPS.length,
    stepName: stepInfo.name,
    completion,
    canGoBack: stepIndex > 0,
    canGoNext,
  };
}

// Get completion status for current step
function getStepCompletion(state: StructuredWorkflowState): {
  canGoNext: boolean;
  completion: number;
} {
  switch (state.currentStep) {
    case "idea":
      return getIdeaStepCompletion(state.initialPrompt);

    case "outline":
      return getOutlineStepCompletion(state.contentOutline);

    case "parameters":
      return { canGoNext: true, completion: 100 }; // Optional step

    case "generate":
      return { canGoNext: true, completion: state.finalPrd ? 100 : 0 };

    case "complete":
      return { canGoNext: false, completion: 100 };

    default:
      return { canGoNext: false, completion: 0 };
  }
}

// Calculate idea step completion
function getIdeaStepCompletion(prompt: string): {
  canGoNext: boolean;
  completion: number;
} {
  const canGoNext = prompt.trim().length > MIN_PROMPT_LENGTH;
  const completion = Math.min(
    100,
    (prompt.length / PROMPT_COMPLETION_TARGET) * 100
  );

  return { canGoNext, completion };
}

// Calculate outline step completion
function getOutlineStepCompletion(contentOutline: {
  functionalRequirements: unknown[];
  successMetrics: unknown[];
  milestones: unknown[];
}): {
  canGoNext: boolean;
  completion: number;
} {
  const totalItems =
    contentOutline.functionalRequirements.length +
    contentOutline.successMetrics.length +
    contentOutline.milestones.length;

  const canGoNext = totalItems > 0;
  const completion = totalItems > 0 ? 100 : 0;

  return { canGoNext, completion };
}
