import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(value?: string) {
  if (value == null || value.trim().length === 0) return undefined;
  return value.trim();
}

export function calculateProgress(currentStep: number, totalSteps: number) {
  return Math.round((currentStep / totalSteps) * 100);
}

export type WorkflowStep =
  | "idea"
  | "outline"
  | "settings"
  | "generate"
  | "complete";

export const WORKFLOW_STEPS: {
  id: WorkflowStep;
  name: string;
  description: string;
}[] = [
  {
    id: "idea",
    name: "Idea Capture",
    description: "Describe your product concept",
  },
  {
    id: "outline",
    name: "Content Outline",
    description: "Review functional requirements & metrics",
  },
  {
    id: "settings",
    name: "Enterprise Settings",
    description: "Configure deployment & security",
  },
  {
    id: "generate",
    name: "Generate PRD",
    description: "Create final document",
  },
  {
    id: "complete",
    name: "PRD Complete",
    description: "Review generated document",
  },
];

export function getStepIndex(step: WorkflowStep): number {
  return WORKFLOW_STEPS.findIndex((s) => s.id === step);
}

export function getStepInfo(step: WorkflowStep) {
  return WORKFLOW_STEPS.find((s) => s.id === step);
}

/**
 * Sanitize optional text field by trimming whitespace and returning undefined for empty strings
 */
export const sanitizeOptionalField = (value?: string) => {
  if (value == null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};
