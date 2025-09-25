// Progress calculation helpers for structured workflow

import { WORKFLOW_STEPS } from "@/config/workflow/steps";

import type {
  StructuredWorkflowState,
  WorkflowProgress,
  WorkflowStep,
} from "@/types/workflow";

export const MIN_PROMPT_LENGTH = 10;
export const PROMPT_COMPLETION_TARGET = 50;

// Get step IDs for easier manipulation
const STEP_IDS = WORKFLOW_STEPS.map((step) => step.id);

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
      if (state.finalPrd.trim().length === 0) {
        return { canGoNext: false, completion: 0 };
      }
      return { canGoNext: true, completion: 100 };

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

/**
 * Calculate workflow progress (alternative implementation)
 */
export function calculateProgress(
  currentStep: WorkflowStep,
  completedSteps: WorkflowStep[]
): WorkflowProgress {
  const totalSteps = STEP_IDS.length;
  const completedCount = completedSteps.length;
  const currentStepIndex = STEP_IDS.indexOf(currentStep);

  return {
    step: currentStepIndex + 1,
    totalSteps,
    stepName: currentStep,
    completion: Math.round((completedCount / totalSteps) * 100),
    canGoBack: currentStepIndex > 0,
    canGoNext: currentStepIndex < totalSteps - 1,
  };
}

/**
 * Check if step can be navigated to
 */
export function canNavigateToStep(
  targetStep: WorkflowStep,
  completedSteps: WorkflowStep[]
): boolean {
  const targetIndex = STEP_IDS.indexOf(targetStep);
  const maxAllowedIndex = Math.max(0, completedSteps.length);
  return targetIndex <= maxAllowedIndex;
}

/**
 * Workflow state setter type
 */
export type WorkflowStateSetter = (
  updater:
    | StructuredWorkflowState
    | ((prev: StructuredWorkflowState) => StructuredWorkflowState)
) => void;
