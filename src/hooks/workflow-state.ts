/**
 * Workflow state management utilities
 */

import { WORKFLOW_STEPS } from "@/config/workflow/steps";

import type {
  StructuredWorkflowState,
  WorkflowProgress,
  WorkflowStep,
} from "@/types/workflow";

// Get step IDs for easier manipulation
const STEP_IDS = WORKFLOW_STEPS.map((step) => step.id);

/**
 * Calculate workflow progress
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

export type WorkflowStateSetter = (
  updater:
    | StructuredWorkflowState
    | ((prev: StructuredWorkflowState) => StructuredWorkflowState)
) => void;
