/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react/pure";
import type { RenderHookResult } from "@testing-library/react/pure";
import { useState } from "react";

import { useContentEditing } from "@/hooks/use-content-editing";
import { createWorkflowStateFixture } from "@/test-utils/workflow-fixtures";

import type {
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricField,
  SuccessMetricSchema,
} from "@/types/workflow";

type ContentEditingState = ReturnType<typeof createWorkflowStateFixture>;
type ContentEditingActions = ReturnType<typeof useContentEditing>;

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

describe("useContentEditing", () => {
  it("manages functional requirements through add, update, and delete operations", () => {
    const { result } = renderUseContentEditing();
    const newRequirement = createNewFunctionalRequirement();

    act(() => {
      result.current.editing.addFunctionalRequirement(newRequirement);
    });

    expect(
      result.current.state.contentOutline.functionalRequirements.some(
        (item: FunctionalRequirement) => item.id === newRequirement.id
      )
    ).toBe(true);

    act(() => {
      result.current.editing.updateFunctionalRequirement("fr-existing", {
        title: "Support enterprise SSO with audit logs",
      });
    });

    expect(
      result.current.state.contentOutline.functionalRequirements.find(
        (item: FunctionalRequirement) => item.id === "fr-existing"
      )?.title
    ).toBe("Support enterprise SSO with audit logs");

    act(() => {
      result.current.editing.deleteFunctionalRequirement("fr-existing");
    });

    expect(
      result.current.state.contentOutline.functionalRequirements.some(
        (item: FunctionalRequirement) => item.id === newRequirement.id
      )
    ).toBe(true);
    expect(
      result.current.state.contentOutline.functionalRequirements.some(
        (item: FunctionalRequirement) => item.id === "fr-existing"
      )
    ).toBe(false);
  });

  it("manages success metrics through add, update, and delete operations", () => {
    const { result } = renderUseContentEditing();
    const newMetric = createNewSuccessMetric();

    act(() => {
      result.current.editing.addSuccessMetric(newMetric);
    });

    expect(
      result.current.state.contentOutline.successMetrics.some(
        (item: SuccessMetric) => item.id === newMetric.id
      )
    ).toBe(true);

    act(() => {
      result.current.editing.updateSuccessMetric("sm-existing", {
        target: "90%",
        owner: "VP Growth",
      });
    });

    const updatedMetric =
      result.current.state.contentOutline.successMetrics.find(
        (item: SuccessMetric) => item.id === "sm-existing"
      );
    expect(updatedMetric?.target).toBe("90%");
    expect(updatedMetric?.owner).toBe("VP Growth");

    act(() => {
      result.current.editing.deleteSuccessMetric("sm-existing");
    });

    expect(
      result.current.state.contentOutline.successMetrics.some(
        (item: SuccessMetric) => item.id === newMetric.id
      )
    ).toBe(true);
    expect(
      result.current.state.contentOutline.successMetrics.some(
        (item: SuccessMetric) => item.id === "sm-existing"
      )
    ).toBe(false);
  });

  it("manages milestones through add, update, and delete operations", () => {
    const { result } = renderUseContentEditing();
    const newMilestone = createNewMilestone();

    act(() => {
      result.current.editing.addMilestone(newMilestone);
    });

    expect(
      result.current.state.contentOutline.milestones.some(
        (item: Milestone) => item.id === newMilestone.id
      )
    ).toBe(true);

    act(() => {
      result.current.editing.updateMilestone("ms-existing", {
        description: "Finalize security review and mitigation plan.",
      });
    });

    expect(
      result.current.state.contentOutline.milestones.find(
        (item: Milestone) => item.id === "ms-existing"
      )?.description
    ).toBe("Finalize security review and mitigation plan.");

    act(() => {
      result.current.editing.deleteMilestone("ms-existing");
    });

    expect(
      result.current.state.contentOutline.milestones.some(
        (item: Milestone) => item.id === newMilestone.id
      )
    ).toBe(true);
    expect(
      result.current.state.contentOutline.milestones.some(
        (item: Milestone) => item.id === "ms-existing"
      )
    ).toBe(false);
  });

  it("manages customer journeys through add, update, and delete operations", () => {
    const { result } = renderUseContentEditing();
    const newJourney = createNewJourney();

    act(() => {
      result.current.editing.addCustomerJourney(newJourney);
    });

    expect(
      result.current.state.contentOutline.customerJourneys.some(
        (item: CustomerJourney) => item.id === newJourney.id
      )
    ).toBe(true);

    act(() => {
      result.current.editing.updateCustomerJourney("cjs-existing", {
        goal: "Enable SSO with automated monitoring",
      });
    });

    expect(
      result.current.state.contentOutline.customerJourneys.find(
        (item: CustomerJourney) => item.id === "cjs-existing"
      )?.goal
    ).toBe("Enable SSO with automated monitoring");

    act(() => {
      result.current.editing.deleteCustomerJourney("cjs-existing");
    });

    expect(
      result.current.state.contentOutline.customerJourneys.some(
        (item: CustomerJourney) => item.id === newJourney.id
      )
    ).toBe(true);
    expect(
      result.current.state.contentOutline.customerJourneys.some(
        (item: CustomerJourney) => item.id === "cjs-existing"
      )
    ).toBe(false);
  });

  it("manages metric schemas through add, update, and delete operations", () => {
    const { result } = renderUseContentEditing();
    const newSchema = createNewSchema();

    act(() => {
      result.current.editing.addMetricSchema(newSchema);
    });

    expect(
      result.current.state.contentOutline.metricSchemas.some(
        (item: SuccessMetricSchema) => item.id === newSchema.id
      )
    ).toBe(true);

    act(() => {
      result.current.editing.updateMetricSchema("metric-schema-existing", {
        description: "Schema capturing activation and quality metrics",
      });
    });

    expect(
      result.current.state.contentOutline.metricSchemas.find(
        (item: SuccessMetricSchema) => item.id === "metric-schema-existing"
      )?.description
    ).toBe("Schema capturing activation and quality metrics");

    act(() => {
      result.current.editing.deleteMetricSchema("metric-schema-existing");
    });

    expect(
      result.current.state.contentOutline.metricSchemas.some(
        (item: SuccessMetricSchema) => item.id === newSchema.id
      )
    ).toBe(true);
    expect(
      result.current.state.contentOutline.metricSchemas.some(
        (item: SuccessMetricSchema) => item.id === "metric-schema-existing"
      )
    ).toBe(false);
  });

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
