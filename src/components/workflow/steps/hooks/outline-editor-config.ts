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

import { createNewCustomerJourney } from "../customer-journey-helpers";
import { createNewFunctionalRequirement } from "../functional-requirement-helpers";
import { createNewSuccessMetricSchema } from "../metric-schema-helpers";
import { createNewMilestone } from "../milestone-helpers";
import { createNewSuccessMetric } from "../success-metric-helpers";

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

type FieldDescriptor<Item, Draft> =
  | (keyof Draft & keyof Item)
  | {
      key: keyof Draft & keyof Item;
      toDraft?: (value: Item[keyof Item], item: Item) => Draft[keyof Draft];
      fromDraft?: (value: Draft[keyof Draft], draft: Draft) => Item[keyof Item];
    };

type NormalizedFieldDescriptor<Item, Draft> = {
  key: keyof Draft & keyof Item;
  toDraft?: (value: Item[keyof Item], item: Item) => Draft[keyof Draft];
  fromDraft?: (value: Draft[keyof Draft], draft: Draft) => Item[keyof Item];
};

const normalizeDescriptor = <Item, Draft>(
  descriptor: FieldDescriptor<Item, Draft>
): NormalizedFieldDescriptor<Item, Draft> =>
  typeof descriptor === "object" ? descriptor : { key: descriptor };

const makeDraftMapper =
  <Item extends { id: string }, Draft extends { id?: string }>(
    fields: readonly FieldDescriptor<Item, Draft>[]
  ) =>
  (item: Item): Draft => {
    const draft: Partial<Draft> = {};
    draft.id = item.id;

    for (const descriptor of fields) {
      const { key, toDraft } = normalizeDescriptor(descriptor);
      const value = item[key as keyof Item];
      const mappedValue = toDraft?.(value, item) ?? value;
      (draft as Draft)[key as keyof Draft] = mappedValue as Draft[keyof Draft];
    }

    return draft as Draft;
  };

const buildCreateFn =
  <Item extends { id: string }, Draft extends { id?: string }, CreateInput>(
    createItem: (input: CreateInput) => Item,
    fields: readonly FieldDescriptor<Item, Draft>[]
  ) =>
  (draft: Draft, fallbackId?: string): Item => {
    const input: Record<string, unknown> = {};

    for (const descriptor of fields) {
      const { key, fromDraft } = normalizeDescriptor(descriptor);
      const draftValue = draft[key as keyof Draft];
      const mappedValue = fromDraft?.(draftValue, draft) ?? draftValue;
      input[key as string] = mappedValue;
    }

    const created = createItem(input as CreateInput);
    const id = draft.id ?? fallbackId ?? created.id;

    return { ...created, id };
  };

const cloneDefaultDraft = <Draft>(defaults: Draft): Draft =>
  JSON.parse(JSON.stringify(defaults)) as Draft;

const isCustomerJourneyStepArray = (
  steps: unknown
): steps is CustomerJourney["steps"] => Array.isArray(steps);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value);

const isSuccessMetricFieldArray = (
  fields: unknown
): fields is SuccessMetricSchema["fields"] => Array.isArray(fields);

type EntityDescriptor<
  Item extends { id: string },
  Draft extends { id?: string },
  CreateInput,
> = {
  defaultDraft: Draft;
  createItem: (input: CreateInput) => Item;
  fields: readonly FieldDescriptor<Item, Draft>[];
  addToOutline: (outline: ContentOutline, item: Item) => ContentOutline;
  updateInOutline: (
    outline: ContentOutline,
    id: string,
    item: Item
  ) => ContentOutline;
  selectItems: (outline: ContentOutline) => Item[];
};

const buildConfigEntry = <
  Item extends { id: string },
  Draft extends { id?: string },
  CreateInput,
>(
  descriptor: EntityDescriptor<Item, Draft, CreateInput>
): ConfigEntry<Item, Draft> => ({
  defaultDraft: () => cloneDefaultDraft(descriptor.defaultDraft),
  toDraft: makeDraftMapper(descriptor.fields),
  buildItem: buildCreateFn(descriptor.createItem, descriptor.fields),
  addToOutline: descriptor.addToOutline,
  updateInOutline: descriptor.updateInOutline,
  findById: (outline, id) =>
    descriptor.selectItems(outline).find((item) => item.id === id),
});

const requirementDescriptor: EntityDescriptor<
  FunctionalRequirement,
  DraftForKind<"functionalRequirement">,
  Parameters<typeof createNewFunctionalRequirement>[0]
> = {
  defaultDraft: {
    title: "",
    description: "",
    priority: "P1",
  },
  createItem: createNewFunctionalRequirement,
  fields: [
    "title",
    "description",
    "priority",
    "userStory",
    {
      key: "acceptanceCriteria",
      toDraft: (criteria) =>
        Array.isArray(criteria) ? [...criteria] : criteria,
    },
    {
      key: "dependencies",
      toDraft: (dependencies) =>
        Array.isArray(dependencies) ? [...dependencies] : dependencies,
    },
    "estimatedEffort",
  ],
  addToOutline: addFunctionalRequirementToOutline,
  updateInOutline: updateFunctionalRequirementInOutline,
  selectItems: (outline) => outline.functionalRequirements,
};

const successMetricDescriptor: EntityDescriptor<
  SuccessMetric,
  DraftForKind<"successMetric">,
  Parameters<typeof createNewSuccessMetric>[0]
> = {
  defaultDraft: {
    name: "",
    description: "",
    type: "engagement",
  },
  createItem: createNewSuccessMetric,
  fields: [
    "name",
    "description",
    "type",
    "target",
    "measurement",
    "frequency",
    "owner",
  ],
  addToOutline: addSuccessMetricToOutline,
  updateInOutline: updateSuccessMetricInOutline,
  selectItems: (outline) => outline.successMetrics,
};

const milestoneDescriptor: EntityDescriptor<
  Milestone,
  DraftForKind<"milestone">,
  Parameters<typeof createNewMilestone>[0]
> = {
  defaultDraft: {
    title: "",
    description: "",
    phase: "development",
  },
  createItem: createNewMilestone,
  fields: [
    "title",
    "description",
    "phase",
    "estimatedDate",
    {
      key: "dependencies",
      toDraft: (dependencies) =>
        Array.isArray(dependencies) ? [...dependencies] : dependencies,
    },
    {
      key: "deliverables",
      toDraft: (deliverables) =>
        Array.isArray(deliverables) ? [...deliverables] : deliverables,
    },
  ],
  addToOutline: addMilestoneToOutline,
  updateInOutline: updateMilestoneInOutline,
  selectItems: (outline) => outline.milestones,
};

const customerJourneyDescriptor: EntityDescriptor<
  CustomerJourney,
  DraftForKind<"customerJourney">,
  Parameters<typeof createNewCustomerJourney>[0]
> = {
  defaultDraft: {
    title: "",
    role: "",
    goal: "",
    steps: [],
    painPoints: [],
  },
  createItem: createNewCustomerJourney,
  fields: [
    "title",
    "role",
    "goal",
    "successCriteria",
    {
      key: "steps",
      toDraft: (steps) => {
        if (!isCustomerJourneyStepArray(steps)) {
          return steps;
        }

        return steps.map((step) => ({
          id: step.id,
          description: step.description,
        }));
      },
    },
    {
      key: "painPoints",
      toDraft: (points) => (isStringArray(points) ? [...points] : points),
    },
  ],
  addToOutline: addCustomerJourneyToOutline,
  updateInOutline: updateCustomerJourneyInOutline,
  selectItems: (outline) => outline.customerJourneys,
};

const metricSchemaDescriptor: EntityDescriptor<
  SuccessMetricSchema,
  DraftForKind<"metricSchema">,
  Parameters<typeof createNewSuccessMetricSchema>[0]
> = {
  defaultDraft: {
    title: "",
    description: "",
    fields: [],
  },
  createItem: createNewSuccessMetricSchema,
  fields: [
    "title",
    "description",
    {
      key: "fields",
      toDraft: (fields) => {
        if (!isSuccessMetricFieldArray(fields)) {
          return fields;
        }

        return fields.map((field) => ({
          id: field.id,
          name: field.name,
          description: field.description,
          dataType: field.dataType,
          required: field.required,
          allowedValues: isStringArray(field.allowedValues)
            ? [...field.allowedValues]
            : field.allowedValues,
          sourceSystem: field.sourceSystem,
        }));
      },
    },
  ],
  addToOutline: addMetricSchemaToOutline,
  updateInOutline: updateMetricSchemaInOutline,
  selectItems: (outline) => outline.metricSchemas,
};

const CONFIG_MAP: {
  readonly [K in EditorKind]: ConfigEntry<ItemForKind<K>, DraftForKind<K>>;
} = {
  functionalRequirement: buildConfigEntry(requirementDescriptor),
  successMetric: buildConfigEntry(successMetricDescriptor),
  milestone: buildConfigEntry(milestoneDescriptor),
  customerJourney: buildConfigEntry(customerJourneyDescriptor),
  metricSchema: buildConfigEntry(metricSchemaDescriptor),
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
