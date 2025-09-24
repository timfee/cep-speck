/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { createContentOutlineFixture } from "@/test-utils/workflow-fixtures";
import type { ContentOutline } from "@/types/workflow";

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
        case "functionalRequirement":
          expect(draft).toEqual({
            id: existing.id,
            title: existing.title,
            description: existing.description,
            priority: existing.priority,
            userStory: existing.userStory,
            acceptanceCriteria: existing.acceptanceCriteria,
            dependencies: existing.dependencies,
            estimatedEffort: existing.estimatedEffort,
          });
          break;
        case "successMetric":
          expect(draft).toEqual({
            id: existing.id,
            name: existing.name,
            description: existing.description,
            type: existing.type,
            target: existing.target,
            measurement: existing.measurement,
            frequency: existing.frequency,
            owner: existing.owner,
          });
          break;
        case "milestone":
          expect(draft).toEqual({
            id: existing.id,
            title: existing.title,
            description: existing.description,
            phase: existing.phase,
            estimatedDate: existing.estimatedDate,
            dependencies: existing.dependencies,
            deliverables: existing.deliverables,
          });
          break;
        case "customerJourney":
          expect(draft).toEqual({
            id: existing.id,
            title: existing.title,
            role: existing.role,
            goal: existing.goal,
            successCriteria: existing.successCriteria,
            steps: existing.steps.map((step) => ({
              id: step.id,
              description: step.description,
            })),
            painPoints: existing.painPoints ?? [],
          });
          break;
        case "metricSchema":
          expect(draft).toEqual({
            id: existing.id,
            title: existing.title,
            description: existing.description,
            fields: existing.fields.map((field) => ({
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
  );

  it.each(editorKinds)(
    "builds sanitised items and mutates outlines for %s",
    (kind) => {
      const draft = creationDrafts[kind] as DraftForKind<typeof kind>;
      const fallbackId = `${kind}-fallback`;
      const built = buildItemFromDraft(kind, draft, fallbackId);

      switch (kind) {
        case "functionalRequirement":
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
          expect(built.estimatedEffort).toBeUndefined();
          break;
        case "successMetric":
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
          break;
        case "milestone":
          expect(built).toMatchObject({
            id: fallbackId,
            title: "Launch automation globally",
            description: "Deploy provisioning automation to all regions",
            phase: "launch",
            dependencies: ["workflow-engine"],
            deliverables: ["Runbook"],
          });
          expect(built.estimatedDate).toBeUndefined();
          break;
        case "customerJourney":
          expect(built).toMatchObject({
            id: fallbackId,
            title: "Admin reviews automation",
            role: "IT admin",
            goal: "Approve automation rollout",
            successCriteria: "Monitoring is configured",
            painPoints: ["Slow approvals"],
          });
          expect(built.steps).toHaveLength(1);
          expect(built.steps[0]).toMatchObject({
            id: "draft-step-1",
            description: "Review automation proposal",
          });
          break;
        case "metricSchema":
          expect(built).toMatchObject({
            id: fallbackId,
            title: "Provisioning schema",
            description: "Tracks provisioning signals",
          });
          expect(built.fields).toHaveLength(1);
          expect(built.fields[0]).toMatchObject({
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
});
