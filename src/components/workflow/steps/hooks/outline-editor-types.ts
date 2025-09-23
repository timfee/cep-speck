import type {
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
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
    };

export type EditorValues =
  | FunctionalRequirementDraft
  | SuccessMetricDraft
  | MilestoneDraft;

export type EditorKind = EditorState["kind"];

type DraftMap = {
  functionalRequirement: FunctionalRequirementDraft;
  successMetric: SuccessMetricDraft;
  milestone: MilestoneDraft;
};

type EntityMap = {
  functionalRequirement: FunctionalRequirement;
  successMetric: SuccessMetric;
  milestone: Milestone;
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
