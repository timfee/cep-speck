import { DEFAULT_ENTERPRISE_PARAMETERS } from "@/types/workflow";
import type { StructuredWorkflowState } from "@/types/workflow";

// Initial state for the workflow
export const initialWorkflowState: StructuredWorkflowState = {
  currentStep: "idea",
  initialPrompt: "",
  contentOutline: {
    functionalRequirements: [],
    successMetrics: [],
    milestones: [],
  },
  enterpriseParameters: DEFAULT_ENTERPRISE_PARAMETERS,
  selectedSections: [],
  sectionContents: {},
  sectionOrder: [],
  finalPrd: "",
  progress: {
    step: 1,
    totalSteps: 4,
    stepName: "Idea Capture",
    completion: 0,
    canGoBack: false,
    canGoNext: false,
  },
  isLoading: false,
};
