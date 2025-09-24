import { DEFAULT_ENTERPRISE_PARAMETERS } from "@/config/workflow/enterprise";
import { EMPTY_OUTLINE_METADATA } from "@/lib/services/content-outline-schemas";
import type { StructuredWorkflowState } from "@/types/workflow";

// Initial state for the workflow
export const initialWorkflowState: StructuredWorkflowState = {
  currentStep: "idea",
  initialPrompt: "",
  contentOutline: {
    metadata: { ...EMPTY_OUTLINE_METADATA },
    functionalRequirements: [],
    successMetrics: [],
    milestones: [],
    customerJourneys: [],
    metricSchemas: [],
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
