// Navigation helpers for structured workflow

import type { WorkflowStep } from "@/types/workflow";
import { WORKFLOW_STEPS } from "@/types/workflow";

// Find next step from current step
export function findNextStep(currentStep: WorkflowStep): WorkflowStep | null {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);

  if (currentIndex < WORKFLOW_STEPS.length - 1) {
    return WORKFLOW_STEPS[currentIndex + 1].id as WorkflowStep;
  }

  return null;
}

// Find previous step from current step
export function findPreviousStep(
  currentStep: WorkflowStep
): WorkflowStep | null {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);

  if (currentIndex > 0) {
    return WORKFLOW_STEPS[currentIndex - 1].id as WorkflowStep;
  }

  return null;
}

// Check if navigation is allowed
export function canNavigateNext(canGoNext: boolean): boolean {
  return canGoNext;
}

export function canNavigateBack(canGoBack: boolean): boolean {
  return canGoBack;
}
