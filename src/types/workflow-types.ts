// Workflow types for structured PRD input pipeline

export type WorkflowStep =
  | "idea"
  | "outline"
  | "parameters"
  | "generate"
  | "complete";

// Content outline structures
export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2";
  userStory?: string;
  acceptanceCriteria?: string[];
  dependencies?: string[];
  estimatedEffort?: string;
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  type: "engagement" | "adoption" | "performance" | "business";
  target?: string;
  measurement?: string;
  frequency?: string;
  owner?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  phase:
    | "research"
    | "design"
    | "development"
    | "testing"
    | "launch"
    | "post-launch";
  estimatedDate?: string;
  dependencies?: string[];
  deliverables?: string[];
}

export interface OutlineMetadataPersonaSelection {
  presetId?: string;
  customPersonas?: string[];
}

export interface OutlineMetadata {
  problemStatement: string;
  targetPersonas: OutlineMetadataPersonaSelection;
  businessObjectives: string[];
  constraints: string[];
  successCriteria: string[];
}

export interface CustomerJourneyStep {
  id: string;
  description: string;
}

export interface CustomerJourney {
  id: string;
  title: string;
  role: string;
  goal: string;
  steps: CustomerJourneyStep[];
  painPoints?: string[];
  successCriteria?: string;
}

export interface SuccessMetricField {
  id: string;
  name: string;
  description: string;
  dataType: "string" | "number" | "boolean" | "date";
  required: boolean;
  allowedValues?: string[];
  sourceSystem?: string;
}

export interface SuccessMetricSchema {
  id: string;
  title: string;
  description: string;
  fields: SuccessMetricField[];
}

export interface ContentOutline {
  metadata: OutlineMetadata;
  functionalRequirements: FunctionalRequirement[];
  successMetrics: SuccessMetric[];
  milestones: Milestone[];
  customerJourneys: CustomerJourney[];
  metricSchemas: SuccessMetricSchema[];
}

// Enterprise-specific parameter options
export interface EnterpriseParameters {
  targetSku: "basic" | "premium" | "enterprise";
  deploymentModel: "cloud" | "on-premise" | "hybrid";
  securityRequirements: string[];
  integrations: string[];
  supportLevel: "basic" | "standard" | "premium";
  rolloutStrategy: "immediate" | "phased" | "pilot";
}

export interface SectionDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedWords: number;
  required: boolean;
  prompt: string;
}

export interface WorkflowProgress {
  step: number;
  totalSteps: number;
  stepName: WorkflowStep;
  completion: number;
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

export interface SerializedOutlineMetadata {
  problemStatement: string;
  businessObjectives: string[];
  constraints: string[];
  successCriteria: string[];
  targetPersonas: OutlineMetadataPersonaSelection;
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
