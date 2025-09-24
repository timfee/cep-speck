import type { WorkflowStepDefinition } from "@/types/workflow";

export const WORKFLOW_STEPS: readonly WorkflowStepDefinition[] = [
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
    id: "parameters",
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
