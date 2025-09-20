// Workflow state management helpers

import type { WorkflowStep, WorkflowProgress } from "@/types/workflow";
import { WORKFLOW_STEPS } from "@/types/workflow";

// Get step IDs for easier manipulation
const STEP_IDS = WORKFLOW_STEPS.map((step) => step.id) as WorkflowStep[];

// Calculate workflow progress
export function calculateProgress(
  _currentStep: WorkflowStep,
  completedSteps: WorkflowStep[]
): WorkflowProgress {
  const totalSteps = STEP_IDS.length;
  const completedCount = completedSteps.length;
  const currentStepIndex = STEP_IDS.indexOf(_currentStep);

  return {
    step: currentStepIndex + 1,
    totalSteps,
    stepName: _currentStep,
    completion: Math.round((completedCount / totalSteps) * 100),
    canGoBack: currentStepIndex > 0,
    canGoNext: currentStepIndex < totalSteps - 1,
  };
}

// Check if step can be navigated to
export function canNavigateToStep(
  targetStep: WorkflowStep,
  completedSteps: WorkflowStep[]
): boolean {
  const targetIndex = STEP_IDS.indexOf(targetStep);

  // Can always go to the first step
  if (targetIndex === 0) {
    return true;
  }

  // Can navigate to a step if all previous steps are completed
  const previousSteps = STEP_IDS.slice(0, targetIndex);
  return previousSteps.every((step) => completedSteps.includes(step));
}

// Get next available step
export function getNextStep(
  currentStep: WorkflowStep,
  completedSteps: WorkflowStep[]
): WorkflowStep | null {
  const currentIndex = STEP_IDS.indexOf(currentStep);
  const nextIndex = currentIndex + 1;

  if (nextIndex >= STEP_IDS.length) {
    return null;
  }

  const nextStep = STEP_IDS[nextIndex];
  return canNavigateToStep(nextStep, completedSteps) ? nextStep : null;
}

// Get previous step
export function getPreviousStep(
  currentStep: WorkflowStep
): WorkflowStep | null {
  const currentIndex = STEP_IDS.indexOf(currentStep);
  const previousIndex = currentIndex - 1;

  return previousIndex >= 0 ? STEP_IDS[previousIndex] : null;
}

// Check if step is completed
export function isStepCompleted(
  step: WorkflowStep,
  completedSteps: WorkflowStep[]
): boolean {
  return completedSteps.includes(step);
}

// Mark step as completed
export function markStepCompleted(
  step: WorkflowStep,
  completedSteps: WorkflowStep[]
): WorkflowStep[] {
  if (completedSteps.includes(step)) {
    return completedSteps;
  }
  return [...completedSteps, step];
}

// Remove step from completed list
export function markStepIncomplete(
  step: WorkflowStep,
  completedSteps: WorkflowStep[]
): WorkflowStep[] {
  return completedSteps.filter((completedStep) => completedStep !== step);
}
