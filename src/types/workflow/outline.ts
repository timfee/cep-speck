// Outline-related workflow types

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
  customValue: string;
  useCustom?: boolean;
}

export interface OutlineMetadataListSelection {
  presetIds: string[];
  customValues: string[];
}

export interface SerializedPresetSelection {
  id: string;
  label: string;
  description?: string;
}

export interface SerializedListSelection {
  presets: SerializedPresetSelection[];
  custom: string[];
}

export interface SerializedPrimaryPersonaSelection {
  preset?: SerializedPresetSelection;
  customValue?: string;
}

export interface SerializedOutlineMetadata {
  projectName: string;
  projectTagline: string;
  problemStatement: string;
  notes: string;
  primaryPersona: SerializedPrimaryPersonaSelection;
  secondaryPersonas: SerializedListSelection;
  valuePropositions: SerializedListSelection;
  targetUsers: SerializedListSelection;
  platforms: SerializedListSelection;
  regions: SerializedListSelection;
  strategicRisks: SerializedListSelection;
}

export interface OutlineMetadata {
  projectName: string;
  projectTagline: string;
  problemStatement: string;
  primaryPersona: OutlineMetadataPersonaSelection;
  secondaryPersonas: OutlineMetadataListSelection;
  valuePropositions: OutlineMetadataListSelection;
  targetUsers: OutlineMetadataListSelection;
  platforms: OutlineMetadataListSelection;
  regions: OutlineMetadataListSelection;
  strategicRisks: OutlineMetadataListSelection;
  notes: string;
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
  successCriteria?: string;
  steps: CustomerJourneyStep[];
  painPoints?: string[];
}

export type MetricFieldType =
  | "string"
  | "number"
  | "percentage"
  | "boolean"
  | "enum";

export interface SuccessMetricField {
  id: string;
  name: string;
  description: string;
  dataType: MetricFieldType;
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
  executiveSummary?: {
    problemStatement: string;
    proposedSolution: string;
    businessValue: string;
    targetUsers: string;
  };
}
