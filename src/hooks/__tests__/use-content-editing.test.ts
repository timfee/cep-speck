/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react/pure";
import type { RenderHookResult } from "@testing-library/react/pure";
import { useState } from "react";

import type {
  ContentEditingActions,
  OutlineActionRegistry,
} from "@/hooks/use-content-editing";

import { useContentEditing } from "@/hooks/use-content-editing";
import { createWorkflowStateFixture } from "@/tests/lib/workflow-fixtures";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricField,
  SuccessMetricSchema,
} from "@/types/workflow";

type ContentEditingState = ReturnType<typeof createWorkflowStateFixture>;
type ContentEditingHookResult = {
  state: ContentEditingState;
  editing: ContentEditingActions;
};

const useContentEditingTestHook = (): ContentEditingHookResult => {
  const [state, setState] = useState(createWorkflowStateFixture());
  const editing = useContentEditing(setState);
  const result: ContentEditingHookResult = { state, editing };
  return result;
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

type OutlineRegistryKey = keyof OutlineActionRegistry;

type OutlineCollection = ContentOutline;

const outlineHandlerTestCases = [
  {
    name: "FunctionalRequirement",
    addKey: "addFunctionalRequirement",
    updateKey: "updateFunctionalRequirement",
    deleteKey: "deleteFunctionalRequirement",
    collection: (outline: OutlineCollection): FunctionalRequirement[] =>
      outline.functionalRequirements,
    createItem: createNewFunctionalRequirement,
    updateId: "fr-existing",
    updates: { title: "Support enterprise SSO with audit logs" },
  },
  {
    name: "SuccessMetric",
    addKey: "addSuccessMetric",
    updateKey: "updateSuccessMetric",
    deleteKey: "deleteSuccessMetric",
    collection: (outline: OutlineCollection): SuccessMetric[] =>
      outline.successMetrics,
    createItem: createNewSuccessMetric,
    updateId: "sm-existing",
    updates: { target: "90%", owner: "VP Growth" },
  },
  {
    name: "Milestone",
    addKey: "addMilestone",
    updateKey: "updateMilestone",
    deleteKey: "deleteMilestone",
    collection: (outline: OutlineCollection): Milestone[] => outline.milestones,
    createItem: createNewMilestone,
    updateId: "ms-existing",
    updates: {
      description: "Finalize security review and mitigation plan.",
    },
  },
  {
    name: "CustomerJourney",
    addKey: "addCustomerJourney",
    updateKey: "updateCustomerJourney",
    deleteKey: "deleteCustomerJourney",
    collection: (outline: OutlineCollection): CustomerJourney[] =>
      outline.customerJourneys,
    createItem: createNewJourney,
    updateId: "cjs-existing",
    updates: { goal: "Enable SSO with automated monitoring" },
  },
  {
    name: "MetricSchema",
    addKey: "addMetricSchema",
    updateKey: "updateMetricSchema",
    deleteKey: "deleteMetricSchema",
    collection: (outline: OutlineCollection): SuccessMetricSchema[] =>
      outline.metricSchemas,
    createItem: createNewSchema,
    updateId: "metric-schema-existing",
    updates: {
      description: "Schema capturing activation and quality metrics",
    },
  },
] as const satisfies ReadonlyArray<{
  name: OutlineRegistryKey;
  addKey: keyof ContentEditingActions;
  updateKey: keyof ContentEditingActions;
  deleteKey: keyof ContentEditingActions;
  collection: (outline: OutlineCollection) => Array<{ id: string }>;
  createItem: () => { id: string };
  updateId: string;
  updates: Record<string, unknown>;
}>;

describe("useContentEditing", () => {
  it.each(outlineHandlerTestCases)(
    "manages $name entries through generated handlers",
    ({
      addKey,
      updateKey,
      deleteKey,
      collection,
      createItem,
      updateId,
      updates,
    }) => {
      const { result } = renderUseContentEditing();
      const newItem = createItem();

      act(() => {
        (result.current.editing[addKey] as (item: typeof newItem) => void)(
          newItem
        );
      });

      expect(
        collection(result.current.state.contentOutline).some(
          (item) => item.id === newItem.id
        )
      ).toBe(true);

      act(() => {
        (
          result.current.editing[updateKey] as (
            id: string,
            updates: typeof updates
          ) => void
        )(updateId, updates);
      });

      const updatedItem = collection(result.current.state.contentOutline).find(
        (item) => item.id === updateId
      );
      expect(updatedItem).toMatchObject(updates);

      act(() => {
        (result.current.editing[deleteKey] as (id: string) => void)(updateId);
      });

      expect(
        collection(result.current.state.contentOutline).some(
          (item) => item.id === updateId
        )
      ).toBe(false);

      expect(
        collection(result.current.state.contentOutline).some(
          (item) => item.id === newItem.id
        )
      ).toBe(true);
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
