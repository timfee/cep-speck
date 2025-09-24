/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react/pure";
import type { RenderHookResult } from "@testing-library/react/pure";
import { useState } from "react";

import { outlineActions, useContentEditing } from "@/hooks/use-content-editing";
import { createWorkflowStateFixture } from "@/test-utils/workflow-fixtures";

import type {
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricField,
  SuccessMetricSchema,
} from "@/types/workflow";

import type {
  OutlineCollectionKind,
  OutlineItem,
} from "../content-editing-utils";

type ContentEditingState = ReturnType<typeof createWorkflowStateFixture>;
type ContentEditingActions = ReturnType<typeof useContentEditing>;

type ContentEditingHookResult = {
  state: ContentEditingState;
  editing: ContentEditingActions;
};

const useContentEditingTestHook = (): ContentEditingHookResult => {
  const [state, setState] = useState(createWorkflowStateFixture());
  const editing = useContentEditing(setState);
  return { state, editing };
};

const renderUseContentEditing = (): RenderHookResult<
  ContentEditingHookResult,
  void
> => renderHook<ContentEditingHookResult, void>(useContentEditingTestHook);

const createNewFunctionalRequirement = (): FunctionalRequirement => ({
  id: "fr-new",
  title: "Automate provisioning",
  description: "Automate tenant provisioning for faster onboarding.",
  priority: "P0",
  userStory: "As an admin, I want automatic provisioning to save time.",
  acceptanceCriteria: ["Provision within 5 minutes"],
  dependencies: ["workflow-engine"],
  estimatedEffort: "2 sprints",
});

const createNewSuccessMetric = (): SuccessMetric => ({
  id: "sm-new",
  name: "Provisioning time",
  description: "Average time from request to active tenant.",
  type: "performance",
  target: "< 10 minutes",
  measurement: "Automated telemetry",
  frequency: "Daily",
  owner: "Analytics lead",
});

const createNewMilestone = (): Milestone => ({
  id: "ms-new",
  title: "Launch provisioning automation",
  description: "Roll out automated provisioning flows to all regions.",
  phase: "launch",
  estimatedDate: "2024-09-01",
  dependencies: ["workflow-engine"],
  deliverables: ["Rollout checklist"],
});

const createNewJourney = (): CustomerJourney => ({
  id: "cjs-new",
  title: "Finance approves purchase",
  role: "Finance manager",
  goal: "Review and approve enterprise purchase order",
  successCriteria: "Purchase order approved on first submission",
  steps: [
    { id: "cjs-new-step-1", description: "Receive provisioning request" },
    { id: "cjs-new-step-2", description: "Validate pricing" },
  ],
  painPoints: ["Manual review delays"],
});

const createNewSchema = (): SuccessMetricSchema => ({
  id: "metric-schema-new",
  title: "Provisioning quality",
  description: "Fields describing provisioning quality metrics",
  fields: [
    {
      id: "metric-field-new",
      name: "Failed provisioning attempts",
      description: "Count of failed provisioning attempts per week",
      dataType: "number",
      required: false,
      allowedValues: undefined,
      sourceSystem: "Ops dashboard",
    } satisfies SuccessMetricField,
  ],
});

type OutlineTestCaseConfig<K extends OutlineCollectionKind> = {
  createNew: () => OutlineItem<K>;
  existingId: string;
  updatePatch: Partial<OutlineItem<K>>;
  selectUpdatedValue: (item: OutlineItem<K>) => unknown;
  expectedUpdatedValue: unknown;
};

type OutlineTestCase<K extends OutlineCollectionKind> =
  OutlineTestCaseConfig<K> & {
    kind: K;
    addKey: (typeof outlineActions)[K]["add"];
    updateKey: (typeof outlineActions)[K]["update"];
    deleteKey: (typeof outlineActions)[K]["delete"];
  };

const createOutlineTestCase = <K extends OutlineCollectionKind>(
  kind: K,
  config: OutlineTestCaseConfig<K>
): OutlineTestCase<K> => ({
  kind,
  addKey: outlineActions[kind].add,
  updateKey: outlineActions[kind].update,
  deleteKey: outlineActions[kind].delete,
  ...config,
});

const outlineTestCases = [
  createOutlineTestCase("functionalRequirements", {
    createNew: createNewFunctionalRequirement,
    existingId: "fr-existing",
    updatePatch: { title: "Support enterprise SSO with audit logs" },
    selectUpdatedValue: (item) => item.title,
    expectedUpdatedValue: "Support enterprise SSO with audit logs",
  }),
  createOutlineTestCase("successMetrics", {
    createNew: createNewSuccessMetric,
    existingId: "sm-existing",
    updatePatch: { owner: "VP Growth", target: "90%" },
    selectUpdatedValue: (item) => [item.owner, item.target],
    expectedUpdatedValue: ["VP Growth", "90%"],
  }),
  createOutlineTestCase("milestones", {
    createNew: createNewMilestone,
    existingId: "ms-existing",
    updatePatch: {
      description: "Finalize security review and mitigation plan.",
    },
    selectUpdatedValue: (item) => item.description,
    expectedUpdatedValue: "Finalize security review and mitigation plan.",
  }),
  createOutlineTestCase("customerJourneys", {
    createNew: createNewJourney,
    existingId: "cjs-existing",
    updatePatch: { goal: "Enable SSO with automated monitoring" },
    selectUpdatedValue: (item) => item.goal,
    expectedUpdatedValue: "Enable SSO with automated monitoring",
  }),
  createOutlineTestCase("metricSchemas", {
    createNew: createNewSchema,
    existingId: "metric-schema-existing",
    updatePatch: {
      description: "Schema capturing activation and quality metrics",
    },
    selectUpdatedValue: (item) => item.description,
    expectedUpdatedValue: "Schema capturing activation and quality metrics",
  }),
] as const;

const outlineTestMatrix = outlineTestCases.map((testCase) => [
  testCase.kind,
  testCase,
]) as const;

describe("useContentEditing", () => {
  it.each(outlineTestMatrix)(
    "generates handlers that mutate %s collections",
    (_label, testCase) => {
      const { result } = renderUseContentEditing();
      const { kind, addKey, updateKey, deleteKey } = testCase;

      const addHandler = result.current.editing[addKey] as (
        item: OutlineItem<typeof kind>
      ) => void;
      const updateHandler = result.current.editing[updateKey] as (
        id: string,
        updates: Partial<OutlineItem<typeof kind>>
      ) => void;
      const deleteHandler = result.current.editing[deleteKey] as (
        id: string
      ) => void;

      const newItem = testCase.createNew();

      act(() => {
        addHandler(newItem);
      });

      const collectionAfterAdd = result.current.state.contentOutline[
        kind
      ] as OutlineItem<typeof kind>[];
      expect(collectionAfterAdd.some((item) => item.id === newItem.id)).toBe(
        true
      );

      act(() => {
        updateHandler(testCase.existingId, testCase.updatePatch);
      });

      const collectionAfterUpdate = result.current.state.contentOutline[
        kind
      ] as OutlineItem<typeof kind>[];
      const updatedItem = collectionAfterUpdate.find(
        (item) => item.id === testCase.existingId
      );
      expect(updatedItem).toBeDefined();
      expect(
        testCase.selectUpdatedValue(updatedItem as OutlineItem<typeof kind>)
      ).toEqual(testCase.expectedUpdatedValue);

      act(() => {
        deleteHandler(testCase.existingId);
      });

      const collectionAfterDelete = result.current.state.contentOutline[
        kind
      ] as OutlineItem<typeof kind>[];

      expect(collectionAfterDelete.some((item) => item.id === newItem.id)).toBe(
        true
      );
      expect(
        collectionAfterDelete.some((item) => item.id === testCase.existingId)
      ).toBe(false);
    }
  );

  it("updates outline metadata", () => {
    const { result } = renderUseContentEditing();

    act(() => {
      result.current.editing.updateOutlineMetadata({
        projectName: "Project Atlas v2",
        notes: "Update timeline with new rollout phases.",
      });
    });

    expect(result.current.state.contentOutline.metadata.projectName).toBe(
      "Project Atlas v2"
    );
    expect(result.current.state.contentOutline.metadata.notes).toBe(
      "Update timeline with new rollout phases."
    );
  });
});
