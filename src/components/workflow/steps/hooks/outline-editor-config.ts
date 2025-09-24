
import type { ContentOutline } from "@/types/workflow";


import type { OutlineEntityMetadata } from "../outline-entity-descriptor";
import { outlineEntityMetadata } from "../outline-entity-metadata";

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

const createConfigEntry = <K extends EditorKind>(
  metadata: OutlineEntityMetadata<ItemForKind<K>, DraftForKind<K>>
): ConfigEntry<ItemForKind<K>, DraftForKind<K>> => ({
  defaultDraft: () => metadata.defaults(),
  toDraft: (item) => metadata.toDraft(item),
  buildItem: (draft, fallbackId) => metadata.fromDraft(draft, fallbackId),
  addToOutline: metadata.addToOutline,
  updateInOutline: metadata.updateInOutline,
  findById: (outline, id) => {
    if (id === undefined || id === "") {
      return undefined;
    }

    return metadata
      .selectFromOutline(outline)
      .find((item) => item[metadata.idKey] === id);
  },
});

type ConfigCacheEntry = ConfigEntry<
  ItemForKind<EditorKind>,
  DraftForKind<EditorKind>
>;

const configCache: Partial<Record<EditorKind, ConfigCacheEntry>> = {};
=======
  addToOutline: (outline, item) =>
    mutateOutline(outline, "functionalRequirements", {
      type: "add",
      item,
    }),
  updateInOutline: (outline, id, item) =>
    mutateOutline(outline, "functionalRequirements", {
      type: "update",
      id,
      updates: item,
    }),
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
  addToOutline: (outline, item) =>
    mutateOutline(outline, "successMetrics", {
      type: "add",
      item,
    }),
  updateInOutline: (outline, id, item) =>
    mutateOutline(outline, "successMetrics", {
      type: "update",
      id,
      updates: item,
    }),
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
  addToOutline: (outline, item) =>
    mutateOutline(outline, "milestones", { type: "add", item }),
  updateInOutline: (outline, id, item) =>
    mutateOutline(outline, "milestones", {
      type: "update",
      id,
      updates: item,
    }),
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
  addToOutline: (outline, item) =>
    mutateOutline(outline, "customerJourneys", {
      type: "add",
      item,
    }),
  updateInOutline: (outline, id, item) =>
    mutateOutline(outline, "customerJourneys", {
      type: "update",
      id,
      updates: item,
    }),
  findById: (outline, id) =>
    outline.customerJourneys.find((journey) => journey.id === id),
};

const getConfigFor = <K extends EditorKind>(
  kind: K
): ConfigEntry<ItemForKind<K>, DraftForKind<K>> => {
  if (!configCache[kind]) {
    const metadata = outlineEntityMetadata[kind] as OutlineEntityMetadata<
      ItemForKind<K>,
      DraftForKind<K>
    >;
    const entry = createConfigEntry(metadata);
    configCache[kind] = entry as unknown as ConfigCacheEntry;
    return entry;
  }

  return configCache[kind] as unknown as ConfigEntry<
    ItemForKind<K>,
    DraftForKind<K>
  >;
};

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
