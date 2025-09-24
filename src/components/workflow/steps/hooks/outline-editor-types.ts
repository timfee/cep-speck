import type {
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricField,
  SuccessMetricSchema,
} from "@/types/workflow";

export type EditorMode = "create" | "edit";

export type FunctionalRequirementDraft = {
  id?: string;
  title: string;
  description: string;
  priority?: FunctionalRequirement["priority"];
  userStory?: string;
  acceptanceCriteria?: FunctionalRequirement["acceptanceCriteria"];
  dependencies?: FunctionalRequirement["dependencies"];
  estimatedEffort?: string;
};

export type SuccessMetricDraft = {
  id?: string;
  name: string;
  description: string;
  type?: SuccessMetric["type"];
  target?: string;
  measurement?: string;
  frequency?: string;
  owner?: string;
};

export type MilestoneDraft = {
  id?: string;
  title: string;
  description: string;
  phase?: Milestone["phase"];
  estimatedDate?: string;
  dependencies?: Milestone["dependencies"];
  deliverables?: Milestone["deliverables"];
};

export type CustomerJourneyStepDraft = {
  id?: string;
  description: string;
};

export type CustomerJourneyDraft = {
  id?: string;
  title: string;
  role: string;
  goal: string;
  successCriteria?: string;
  steps: CustomerJourneyStepDraft[];
  painPoints?: string[];
};

export type SuccessMetricFieldDraft = {
  id?: string;
  name: string;
  description: string;
  dataType?: SuccessMetricField["dataType"];
  required?: boolean;
  allowedValues?: string[];
  sourceSystem?: string;
};

export type SuccessMetricSchemaDraft = {
  id?: string;
  title: string;
  description: string;
  fields: SuccessMetricFieldDraft[];
};

export type EditorState =
  | {
      kind: "functionalRequirement";
      mode: EditorMode;
      data: FunctionalRequirementDraft;
    }
  | {
      kind: "successMetric";
      mode: EditorMode;
      data: SuccessMetricDraft;
    }
  | {
      kind: "milestone";
      mode: EditorMode;
      data: MilestoneDraft;
    }
  | {
      kind: "customerJourney";
      mode: EditorMode;
      data: CustomerJourneyDraft;
    }
  | {
      kind: "metricSchema";
      mode: EditorMode;
      data: SuccessMetricSchemaDraft;
    };

export type EditorValues =
  | FunctionalRequirementDraft
  | SuccessMetricDraft
  | MilestoneDraft
  | CustomerJourneyDraft
  | SuccessMetricSchemaDraft;

export type EditorKind = EditorState["kind"];

export const EDITOR_KINDS = [
  "functionalRequirement",
  "successMetric",
  "milestone",
  "customerJourney",
  "metricSchema",
] as const satisfies ReadonlyArray<EditorKind>;

type DraftMap = {
  functionalRequirement: FunctionalRequirementDraft;
  successMetric: SuccessMetricDraft;
  milestone: MilestoneDraft;
  customerJourney: CustomerJourneyDraft;
  metricSchema: SuccessMetricSchemaDraft;
};

type EntityMap = {
  functionalRequirement: FunctionalRequirement;
  successMetric: SuccessMetric;
  milestone: Milestone;
  customerJourney: CustomerJourney;
  metricSchema: SuccessMetricSchema;
};

export type DraftForKind<K extends EditorKind> = DraftMap[K];
export type ItemForKind<K extends EditorKind> = EntityMap[K];
export type StateForKind<K extends EditorKind> = Extract<
  EditorState,
  { kind: K }
>;

export type RequirementEditorState = Extract<
  EditorState,
  { kind: "functionalRequirement" }
>;
export type SuccessMetricEditorState = Extract<
  EditorState,
  { kind: "successMetric" }
>;
export type MilestoneEditorState = Extract<EditorState, { kind: "milestone" }>;
export type CustomerJourneyEditorState = Extract<
  EditorState,
  { kind: "customerJourney" }
>;
export type MetricSchemaEditorState = Extract<
  EditorState,
  { kind: "metricSchema" }
>;
