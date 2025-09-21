import type {
  EvaluationReport,
  OutlineSection,
  StructuredOutline,
} from "@/lib/agents";

export type WorkflowStep = "idea" | "outline" | "generate" | "complete";

export interface WorkflowProgress {
  step: number;
  totalSteps: number;
  stepName: string;
  completion: number;
  canGoBack: boolean;
  canGoNext: boolean;
  statusLabel?: string;
}

export interface StructuredWorkflowState {
  currentStep: WorkflowStep;
  brief: string;
  outline: StructuredOutline | null;
  draft: string;
  finalDraft: string;
  evaluationReport: EvaluationReport | null;
  iteration: number;
  status: "idle" | "outline" | "generating" | "evaluating" | "refining";
  progress: WorkflowProgress;
  isLoading: boolean;
  error?: string;
}

export type EditableOutlineSection = OutlineSection;

export const WORKFLOW_STEPS = [
  {
    id: "idea",
    name: "Idea Capture",
    description: "Describe your product concept",
  },
  {
    id: "outline",
    name: "Outline",
    description: "Review and edit the generated structure",
  },
  {
    id: "generate",
    name: "Draft & Refine",
    description: "Generate, evaluate, and refine the PRD",
  },
  {
    id: "complete",
    name: "Complete",
    description: "Review the validated PRD",
  },
] as const;

export const EMPTY_OUTLINE: StructuredOutline = { sections: [] };

export const DEFAULT_SECTION_TEMPLATE: EditableOutlineSection = {
  id: "section-1",
  title: "New Section",
  notes: "",
};
