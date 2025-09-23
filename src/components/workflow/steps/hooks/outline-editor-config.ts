import {
  addFunctionalRequirementToOutline,
  addCustomerJourneyToOutline,
  addMilestoneToOutline,
  addSuccessMetricToOutline,
  addMetricSchemaToOutline,
  updateFunctionalRequirementInOutline,
  updateCustomerJourneyInOutline,
  updateMilestoneInOutline,
  updateSuccessMetricInOutline,
  updateMetricSchemaInOutline,
} from "@/hooks/content-editing-utils";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

import {
  createNewFunctionalRequirement,
  createNewMilestone,
  createNewSuccessMetric,
  createNewCustomerJourney,
  createNewSuccessMetricSchema,
} from "../content-outline-helpers";

import type {
  DraftForKind,
  EditorKind,
  ItemForKind,
} from "./outline-editor-types";

type ConfigEntry<Item, Draft> = {
  defaultDraft: () => Draft;
  toDraft: (item: Item) => Draft;
  buildItem: (draft: Draft, fallbackId?: string) => Item;
  addToOutline: (outline: ContentOutline, item: Item) => ContentOutline;
  updateInOutline: (
    outline: ContentOutline,
    id: string,
    item: Item
  ) => ContentOutline;
  findById: (outline: ContentOutline, id?: string) => Item | undefined;
};

const requirementConfig: ConfigEntry<
  FunctionalRequirement,
  DraftForKind<"functionalRequirement">
> = {
  defaultDraft: () => ({
    title: "",
    description: "",
    priority: "P1",
  }),
  toDraft: (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    priority: item.priority,
    userStory: item.userStory,
    acceptanceCriteria: item.acceptanceCriteria,
    dependencies: item.dependencies,
    estimatedEffort: item.estimatedEffort,
  }),
  buildItem: (draft, fallbackId) => {
    const created = createNewFunctionalRequirement({
      title: draft.title,
      description: draft.description,
      priority: draft.priority,
      userStory: draft.userStory,
      acceptanceCriteria: draft.acceptanceCriteria,
      dependencies: draft.dependencies,
      estimatedEffort: draft.estimatedEffort,
    });
    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
  addToOutline: addFunctionalRequirementToOutline,
  updateInOutline: updateFunctionalRequirementInOutline,
  findById: (outline, id) =>
    outline.functionalRequirements.find((item) => item.id === id),
};

const successMetricConfig: ConfigEntry<
  SuccessMetric,
  DraftForKind<"successMetric">
> = {
  defaultDraft: () => ({
    name: "",
    description: "",
    type: "engagement",
  }),
  toDraft: (item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    type: item.type,
    target: item.target,
    measurement: item.measurement,
    frequency: item.frequency,
    owner: item.owner,
  }),
  buildItem: (draft, fallbackId) => {
    const created = createNewSuccessMetric({
      name: draft.name,
      description: draft.description,
      type: draft.type,
      target: draft.target,
      measurement: draft.measurement,
      frequency: draft.frequency,
      owner: draft.owner,
    });
    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
  addToOutline: addSuccessMetricToOutline,
  updateInOutline: updateSuccessMetricInOutline,
  findById: (outline, id) =>
    outline.successMetrics.find((item) => item.id === id),
};

const milestoneConfig: ConfigEntry<Milestone, DraftForKind<"milestone">> = {
  defaultDraft: () => ({
    title: "",
    description: "",
    phase: "development",
  }),
  toDraft: (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    phase: item.phase,
    estimatedDate: item.estimatedDate,
    dependencies: item.dependencies,
    deliverables: item.deliverables,
  }),
  buildItem: (draft, fallbackId) => {
    const created = createNewMilestone({
      title: draft.title,
      description: draft.description,
      phase: draft.phase,
      estimatedDate: draft.estimatedDate,
      dependencies: draft.dependencies,
      deliverables: draft.deliverables,
    });
    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
  addToOutline: addMilestoneToOutline,
  updateInOutline: updateMilestoneInOutline,
  findById: (outline, id) => outline.milestones.find((item) => item.id === id),
};

const customerJourneyConfig: ConfigEntry<
  CustomerJourney,
  DraftForKind<"customerJourney">
> = {
  defaultDraft: () => ({
    title: "",
    role: "",
    goal: "",
    steps: [],
    painPoints: [],
  }),
  toDraft: (item) => ({
    id: item.id,
    title: item.title,
    role: item.role,
    goal: item.goal,
    successCriteria: item.successCriteria,
    steps: item.steps.map((step) => ({
      id: step.id,
      description: step.description,
    })),
    painPoints: item.painPoints ?? [],
  }),
  buildItem: (draft, fallbackId) => {
    const created = createNewCustomerJourney({
      title: draft.title,
      role: draft.role,
      goal: draft.goal,
      successCriteria: draft.successCriteria,
      steps: draft.steps,
      painPoints: draft.painPoints,
    });
    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
  addToOutline: addCustomerJourneyToOutline,
  updateInOutline: updateCustomerJourneyInOutline,
  findById: (outline, id) =>
    outline.customerJourneys.find((journey) => journey.id === id),
};

const metricSchemaConfig: ConfigEntry<
  SuccessMetricSchema,
  DraftForKind<"metricSchema">
> = {
  defaultDraft: () => ({
    title: "",
    description: "",
    fields: [],
  }),
  toDraft: (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    fields: item.fields.map((field) => ({
      id: field.id,
      name: field.name,
      description: field.description,
      dataType: field.dataType,
      required: field.required,
      allowedValues: field.allowedValues,
      sourceSystem: field.sourceSystem,
    })),
  }),
  buildItem: (draft, fallbackId) => {
    const created = createNewSuccessMetricSchema({
      title: draft.title,
      description: draft.description,
      fields: draft.fields,
    });
    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
  addToOutline: addMetricSchemaToOutline,
  updateInOutline: updateMetricSchemaInOutline,
  findById: (outline, id) =>
    outline.metricSchemas.find((schema) => schema.id === id),
};

const CONFIG_MAP = {
  functionalRequirement: requirementConfig,
  successMetric: successMetricConfig,
  milestone: milestoneConfig,
  customerJourney: customerJourneyConfig,
  metricSchema: metricSchemaConfig,
} as const;

const getConfigFor = <K extends EditorKind>(
  kind: K
): ConfigEntry<ItemForKind<K>, DraftForKind<K>> =>
  CONFIG_MAP[kind] as unknown as ConfigEntry<ItemForKind<K>, DraftForKind<K>>;

export const getDefaultDraftFor = <K extends EditorKind>(kind: K) =>
  getConfigFor(kind).defaultDraft();

export const mapItemToDraftFor = <K extends EditorKind>(
  kind: K,
  item: ItemForKind<K>
) => getConfigFor(kind).toDraft(item);

export const buildItemFromDraft = <K extends EditorKind>(
  kind: K,
  draft: DraftForKind<K>,
  fallbackId?: string
) => getConfigFor(kind).buildItem(draft, fallbackId);

export const addItemToOutline = <K extends EditorKind>(
  kind: K,
  outline: ContentOutline,
  item: ItemForKind<K>
) => getConfigFor(kind).addToOutline(outline, item);

export const updateItemInOutline = <K extends EditorKind>(
  kind: K,
  outline: ContentOutline,
  id: string,
  item: ItemForKind<K>
) => getConfigFor(kind).updateInOutline(outline, id, item);

export const findItemForEditor = <K extends EditorKind>(
  kind: K,
  outline: ContentOutline,
  id?: string
) => getConfigFor(kind).findById(outline, id);
