/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { createContentOutlineFixture } from "@/tests/lib/workflow-fixtures";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

import {
  addItemToOutline,
  buildItemFromDraft,
  findItemForEditor,
  getDefaultDraftFor,
  mapItemToDraftFor,
  updateItemInOutline,
} from "../outline-editor-config";

import type {
  DraftForKind,
  EditorKind,
  ItemForKind,
} from "../outline-editor-types";

const editorKinds: EditorKind[] = [
  "functionalRequirement",
  "successMetric",
  "milestone",
  "customerJourney",
  "metricSchema",
];

type OptionalFieldAssertion<K extends EditorKind> = (
  original: ItemForKind<K>,
  draft: DraftForKind<K>,
  rebuilt: ItemForKind<K>
) => void;

const expectMetricSchemaDraftMatches = (
  original: ItemForKind<"metricSchema">,
  draft: DraftForKind<"metricSchema">
) => {
  expect(draft.fields).toHaveLength(original.fields.length);
  expect(draft.fields[0]).toEqual({
    id: original.fields[0]?.id,
    name: original.fields[0]?.name,
    description: original.fields[0]?.description,
    dataType: original.fields[0]?.dataType,
    required: original.fields[0]?.required,
    allowedValues: original.fields[0]?.allowedValues,
    sourceSystem: original.fields[0]?.sourceSystem,
  });
};

const expectMetricSchemaRebuiltMatches = (
  original: ItemForKind<"metricSchema">,
  rebuilt: ItemForKind<"metricSchema">
) => {
  const rebuiltField = rebuilt.fields[0];
  const originalField = original.fields[0];
  expect(rebuiltField?.id).toBe(originalField?.id);
  expect(rebuiltField?.name).toBe(originalField?.name);
  expect(rebuiltField?.description).toBe(originalField?.description);
  expect(rebuiltField?.dataType).toBe(originalField?.dataType);
  expect(rebuiltField?.required).toBe(originalField?.required);
  expect(rebuiltField?.allowedValues).toBeUndefined();
  expect(rebuiltField?.sourceSystem).toBe(originalField?.sourceSystem);
};

const optionalFieldAssertions: {
  [K in EditorKind]: OptionalFieldAssertion<K>;
} = {
  functionalRequirement: (original, draft, rebuilt) => {
    expect(draft.userStory).toBe(original.userStory);
    expect(rebuilt.userStory).toBe(original.userStory);
    expect(draft.acceptanceCriteria).toEqual(original.acceptanceCriteria);
    expect(rebuilt.acceptanceCriteria).toEqual(original.acceptanceCriteria);
    expect(draft.dependencies).toEqual(original.dependencies);
    expect(rebuilt.dependencies).toEqual(original.dependencies);
    expect(draft.estimatedEffort).toBe(original.estimatedEffort);
    expect(rebuilt.estimatedEffort).toBe(original.estimatedEffort);
  },
  successMetric: (original, draft, rebuilt) => {
    expect(draft.type).toBe(original.type);
    expect(rebuilt.type).toBe(original.type);
    expect(draft.target).toBe(original.target);
    expect(rebuilt.target).toBe(original.target);
    expect(draft.measurement).toBe(original.measurement);
    expect(rebuilt.measurement).toBe(original.measurement);
    expect(draft.frequency).toBe(original.frequency);
    expect(rebuilt.frequency).toBe(original.frequency);
    expect(draft.owner).toBe(original.owner);
    expect(rebuilt.owner).toBe(original.owner);
  },
  milestone: (original, draft, rebuilt) => {
    expect(draft.phase).toBe(original.phase);
    expect(rebuilt.phase).toBe(original.phase);
    expect(draft.estimatedDate).toBe(original.estimatedDate);
    expect(rebuilt.estimatedDate).toBe(original.estimatedDate);
    expect(draft.dependencies).toEqual(original.dependencies);
    expect(rebuilt.dependencies).toEqual(original.dependencies);
    expect(draft.deliverables).toEqual(original.deliverables);
    expect(rebuilt.deliverables).toEqual(original.deliverables);
  },
  customerJourney: (original, draft, rebuilt) => {
    expect(draft.successCriteria).toBe(original.successCriteria);
    expect(rebuilt.successCriteria).toBe(original.successCriteria);
    expect(draft.steps).toEqual(
      original.steps.map((step) => ({
        id: step.id,
        description: step.description,
      }))
    );
    expect(
      rebuilt.steps.map((step) => ({
        id: step.id,
        description: step.description,
      }))
    ).toEqual(
      original.steps.map((step) => ({
        id: step.id,
        description: step.description,
      }))
    );
    expect(draft.painPoints).toEqual(original.painPoints ?? []);
    expect(rebuilt.painPoints).toEqual(original.painPoints ?? []);
  },
  metricSchema: (original, draft, rebuilt) => {
    expectMetricSchemaDraftMatches(original, draft);
    expectMetricSchemaRebuiltMatches(original, rebuilt);
  },
};

const defaultDraftExpectations: Record<EditorKind, DraftForKind<EditorKind>> = {
  functionalRequirement: {
    title: "",
    description: "",
    priority: "P1",
  },
  successMetric: {
    name: "",
    description: "",
    type: "engagement",
  },
  milestone: {
    title: "",
    description: "",
    phase: "development",
  },
  customerJourney: {
    title: "",
    role: "",
    goal: "",
    steps: [],
    painPoints: [],
  },
  metricSchema: {
    title: "",
    description: "",
    fields: [],
  },
};

const creationDrafts: Record<EditorKind, DraftForKind<EditorKind>> = {
  functionalRequirement: {
    title: "  Automated data sync  ",
    description: "  Keep customer data in sync across systems  ",
    priority: "P2",
    userStory: "  As an admin, I want automated sync to reduce manual work.  ",
    acceptanceCriteria: ["Sync attempts logged"],
    dependencies: ["data-service"],
    estimatedEffort: "   ",
  },
  successMetric: {
    name: "  Time to provision  ",
    description: "  Measures time from request to active tenant  ",
    type: "performance",
    target: "  < 10 minutes  ",
    measurement: "  system telemetry  ",
    frequency: "  weekly  ",
    owner: "  Platform lead  ",
  },
  milestone: {
    title: "  Launch automation globally  ",
    description: "  Deploy provisioning automation to all regions  ",
    phase: "launch",
    estimatedDate: "   ",
    dependencies: ["workflow-engine"],
    deliverables: ["Runbook"],
  },
  customerJourney: {
    title: "  Admin reviews automation  ",
    role: "  IT admin  ",
    goal: "  Approve automation rollout  ",
    successCriteria: "  Monitoring is configured  ",
    steps: [
      { id: "draft-step-1", description: "  Review automation proposal  " },
      { id: "draft-step-2", description: "   " },
    ],
    painPoints: ["  Slow approvals  ", "  "],
  },
  metricSchema: {
    title: "  Provisioning schema  ",
    description: "  Tracks provisioning signals  ",
    fields: [
      {
        id: "draft-field-1",
        name: "  Provisioning status  ",
        description: "  Current provisioning status  ",
        dataType: "enum",
        required: true,
        allowedValues: ["  Active  ", "  ", "Paused"],
        sourceSystem: "  Ops db  ",
      },
    ],
  },
};

const updateMutations: Record<EditorKind, Partial<ItemForKind<EditorKind>>> = {
  functionalRequirement: { description: "Updated SSO requirement" },
  successMetric: { measurement: "Monthly reporting" },
  milestone: { phase: "testing" },
  customerJourney: { goal: "Reduce approval time" },
  metricSchema: { description: "Updated schema with rollout metrics" },
};

const getCollection = <K extends EditorKind>(
  outline: ContentOutline,
  kind: K
): ItemForKind<K>[] => {
  switch (kind) {
    case "functionalRequirement":
      return outline.functionalRequirements as ItemForKind<K>[];
    case "successMetric":
      return outline.successMetrics as ItemForKind<K>[];
    case "milestone":
      return outline.milestones as ItemForKind<K>[];
    case "customerJourney":
      return outline.customerJourneys as ItemForKind<K>[];
    case "metricSchema":
      return outline.metricSchemas as ItemForKind<K>[];
  }
};

describe("outline-editor-config", () => {
  it.each(editorKinds)(
    "exposes correct defaults and draft mapping for %s",
    (kind) => {
      expect(getDefaultDraftFor(kind)).toEqual(defaultDraftExpectations[kind]);

      const outline = createContentOutlineFixture();
      const existing = getCollection(outline, kind)[0];
      const draft = mapItemToDraftFor(kind, existing);

      switch (kind) {
        case "functionalRequirement": {
          const requirement = existing as FunctionalRequirement;
          expect(draft).toEqual({
            id: requirement.id,
            title: requirement.title,
            description: requirement.description,
            priority: requirement.priority,
            userStory: requirement.userStory,
            acceptanceCriteria: requirement.acceptanceCriteria,
            dependencies: requirement.dependencies,
            estimatedEffort: requirement.estimatedEffort,
          });
          break;
        }
        case "successMetric": {
          const successMetric = existing as SuccessMetric;
          expect(draft).toEqual({
            id: successMetric.id,
            name: successMetric.name,
            description: successMetric.description,
            type: successMetric.type,
            target: successMetric.target,
            measurement: successMetric.measurement,
            frequency: successMetric.frequency,
            owner: successMetric.owner,
          });
          break;
        }
        case "milestone": {
          const milestone = existing as Milestone;
          expect(draft).toEqual({
            id: milestone.id,
            title: milestone.title,
            description: milestone.description,
            phase: milestone.phase,
            estimatedDate: milestone.estimatedDate,
            dependencies: milestone.dependencies,
            deliverables: milestone.deliverables,
          });
          break;
        }
        case "customerJourney": {
          const journey = existing as CustomerJourney;
          expect(draft).toEqual({
            id: journey.id,
            title: journey.title,
            role: journey.role,
            goal: journey.goal,
            successCriteria: journey.successCriteria,
            steps: journey.steps.map((step) => ({
              id: step.id,
              description: step.description,
            })),
            painPoints: journey.painPoints ?? [],
          });
          break;
        }
        case "metricSchema": {
          const metricSchema = existing as SuccessMetricSchema;
          expect(draft).toEqual({
            id: metricSchema.id,
            title: metricSchema.title,
            description: metricSchema.description,
            fields: metricSchema.fields.map((field) => ({
              id: field.id,
              name: field.name,
              description: field.description,
              dataType: field.dataType,
              required: field.required,
              allowedValues: field.allowedValues,
              sourceSystem: field.sourceSystem,
            })),
          });
          break;
        }
      }
    }
  );

  it.each(editorKinds)(
    "builds sanitised items and mutates outlines for %s",
    (kind) => {
      const draft = creationDrafts[kind] as DraftForKind<typeof kind>;
      const fallbackId = `${kind}-fallback`;
      const built = buildItemFromDraft(kind, draft, fallbackId);

      switch (kind) {
        case "functionalRequirement": {
          const builtRequirement = built as FunctionalRequirement;
          expect(built).toMatchObject({
            id: fallbackId,
            title: "Automated data sync",
            description: "Keep customer data in sync across systems",
            priority: "P2",
            userStory:
              "As an admin, I want automated sync to reduce manual work.",
            acceptanceCriteria: ["Sync attempts logged"],
            dependencies: ["data-service"],
          });
          expect(builtRequirement.estimatedEffort).toBeUndefined();
          break;
        }
        case "successMetric": {
          const builtMetric = built as SuccessMetric;
          expect(built).toMatchObject({
            id: fallbackId,
            name: "Time to provision",
            description: "Measures time from request to active tenant",
            type: "performance",
            target: "< 10 minutes",
            measurement: "system telemetry",
            frequency: "weekly",
            owner: "Platform lead",
          });
          expect(builtMetric.measurement).toBe("system telemetry");
          break;
        }
        case "milestone": {
          const builtMilestone = built as Milestone;
          expect(built).toMatchObject({
            id: fallbackId,
            title: "Launch automation globally",
            description: "Deploy provisioning automation to all regions",
            phase: "launch",
            dependencies: ["workflow-engine"],
            deliverables: ["Runbook"],
          });
          expect(builtMilestone.estimatedDate).toBeUndefined();
          break;
        }
        case "customerJourney": {
          const builtJourney = built as CustomerJourney;
          expect(built).toMatchObject({
            id: fallbackId,
            title: "Admin reviews automation",
            role: "IT admin",
            goal: "Approve automation rollout",
            successCriteria: "Monitoring is configured",
            painPoints: ["Slow approvals"],
          });
          expect(builtJourney.steps).toHaveLength(1);
          expect(builtJourney.steps[0]).toMatchObject({
            id: "draft-step-1",
            description: "Review automation proposal",
          });
          break;
        }
        case "metricSchema": {
          const builtSchema = built as SuccessMetricSchema;
          expect(built).toMatchObject({
            id: fallbackId,
            title: "Provisioning schema",
            description: "Tracks provisioning signals",
          });
          expect(builtSchema.fields).toHaveLength(1);
          expect(builtSchema.fields[0]).toMatchObject({
            id: "draft-field-1",
            name: "Provisioning status",
            description: "Current provisioning status",
            dataType: "enum",
            required: true,
            allowedValues: ["Active", "Paused"],
            sourceSystem: "Ops db",
          });
          break;
        }
      }

      const outline = createContentOutlineFixture();
      const outlineWithAddition = addItemToOutline(kind, outline, built);
      const collection = getCollection(outline, kind);
      const updatedCollection = getCollection(outlineWithAddition, kind);

      expect(outlineWithAddition).not.toBe(outline);
      expect(updatedCollection.length).toBe(collection.length + 1);
      expect(updatedCollection.some((item) => item.id === fallbackId)).toBe(
        true
      );

      const existing = collection[0]! as ItemForKind<typeof kind>;
      const updatedItem = {
        ...existing,
        ...(updateMutations[kind] as Partial<ItemForKind<typeof kind>>),
      } as ItemForKind<typeof kind>;
      const outlineWithUpdate = updateItemInOutline(
        kind,
        outline,
        existing.id,
        updatedItem
      );

      const updatedMatch = getCollection(outlineWithUpdate, kind).find(
        (item) => item.id === existing.id
      );
      expect(updatedMatch).toMatchObject(updateMutations[kind]);

      expect(findItemForEditor(kind, outlineWithUpdate, existing.id)).toEqual(
        updatedMatch
      );
    }
  );

  it.each(editorKinds)(
    "preserves entity ids and optional fields when round-tripping %s",
    (kind) => {
      const outline = createContentOutlineFixture();
      const original = getCollection(outline, kind)[0] as ItemForKind<
        typeof kind
      >;
      const draft = mapItemToDraftFor(kind, original);
      const fallbackId = `${kind}-fallback`;
      const rebuilt = buildItemFromDraft(kind, draft, fallbackId);

      expect(draft.id).toBe(original.id);
      expect(rebuilt.id).toBe(original.id);
      expect(rebuilt.id).not.toBe(fallbackId);

      optionalFieldAssertions[kind](
        original as ItemForKind<typeof kind>,
        draft as DraftForKind<typeof kind>,
        rebuilt as ItemForKind<typeof kind>
      );
    }
  );
});
