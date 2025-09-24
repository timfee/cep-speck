import type { EnterpriseParameters } from "./enterprise";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SerializedOutlineMetadata,
  SuccessMetric,
  SuccessMetricSchema,
} from "./outline";

import type { SectionDefinition } from "./sections";

export type WorkflowStep =
  | "idea"
  | "outline"
  | "parameters"
  | "generate"
  | "complete";

export interface WorkflowStepDefinition {
  id: WorkflowStep;
  name: string;
  description: string;
}

export interface WorkflowProgress {
  step: number;
  totalSteps: number;
  stepName: string;
  completion: number;
  timeEstimate?: number;
  canGoBack: boolean;
  canGoNext: boolean;
}

export interface StructuredWorkflowState {
  currentStep: WorkflowStep;
  initialPrompt: string;
  contentOutline: ContentOutline;
  enterpriseParameters: EnterpriseParameters;
  selectedSections: string[];
  sectionContents: Record<string, string>;
  sectionOrder: string[];
  finalPrd: string;
  progress: WorkflowProgress;
  isLoading: boolean;
  error?: string;
}

export interface SerializedWorkflowOutline {
  initialPrompt: string;
  enterprise: EnterpriseParameters;
  metadata: SerializedOutlineMetadata;
  functionalRequirements: FunctionalRequirement[];
  successMetrics: SuccessMetric[];
  milestones: Milestone[];
  customerJourneys: CustomerJourney[];
  metricSchemas: SuccessMetricSchema[];
}

export interface SerializedWorkflowSpec {
  version: "phase-4";
  generatedAt: string;
  outline: SerializedWorkflowOutline;
  workflow: {
    initialPrompt: string;
    selectedSections: string[];
    sectionOrder: string[];
    finalPrd?: string;
    openIssues: string[];
  };
  overrides: Record<string, string>;
}

export interface StructuredGenerationRequestBody {
  structuredSpec: SerializedWorkflowSpec;
  outlinePayload: SerializedWorkflowOutline;
  legacySpecText: string;
}

export interface SectionStructureResponse {
  sections: SectionDefinition[];
  estimatedTotalWords: number;
  confidence: number;
}
