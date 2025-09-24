/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

(globalThis as typeof globalThis & { React?: typeof React }).React = React;

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

import { ContentOutlineStep } from "../../src/components/workflow/steps/content-outline-step";

const baseOutline: ContentOutline = {
  metadata: {
    projectName: "",
    projectTagline: "",
    problemStatement: "",
    primaryPersona: { presetId: undefined, customValue: "" },
    secondaryPersonas: { presetIds: [], customValues: [] },
    valuePropositions: { presetIds: [], customValues: [] },
    targetUsers: { presetIds: [], customValues: [] },
    platforms: { presetIds: [], customValues: [] },
    regions: { presetIds: [], customValues: [] },
    strategicRisks: { presetIds: [], customValues: [] },
    notes: "",
  },
  functionalRequirements: [],
  successMetrics: [],
  milestones: [],
  customerJourneys: [],
  metricSchemas: [],
};

function assertIsHTMLElement(
  element: Element | null
): asserts element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    throw new Error("Expected an HTMLElement in the outline test harness");
  }
}

function renderOutlineStep(options: {
  outline?: ContentOutline;
  onAddRequirement?: (requirement: FunctionalRequirement) => void;
  onEditMetric?: (id: string, metric: Partial<SuccessMetric>) => void;
  onDeleteMilestone?: (id: string) => void;
  onAddJourney?: (journey: CustomerJourney) => void;
  onEditMetricSchema?: (
    id: string,
    updates: Partial<SuccessMetricSchema>
  ) => void;
}) {
  const user = userEvent.setup();
  const outline = options.outline ?? baseOutline;
  const onAddRequirement =
    options.onAddRequirement ?? jest.fn<void, [FunctionalRequirement]>();
  const onEditMetric =
    options.onEditMetric ?? jest.fn<void, [string, Partial<SuccessMetric>]>();
  const onDeleteMilestone =
    options.onDeleteMilestone ?? jest.fn<void, [string]>();
  const onAddJourney =
    options.onAddJourney ?? jest.fn<void, [CustomerJourney]>();
  const onEditMetricSchema =
    options.onEditMetricSchema ??
    jest.fn<void, [string, Partial<SuccessMetricSchema>]>();

  render(
    <ContentOutlineStep
      initialPrompt=""
      contentOutline={outline}
      onChange={jest.fn()}
      onRegenerateOutline={jest.fn()}
      onAddFunctionalRequirement={onAddRequirement}
      onEditSuccessMetric={onEditMetric}
      onDeleteMilestone={onDeleteMilestone}
      onAddCustomerJourney={onAddJourney}
      onEditMetricSchema={onEditMetricSchema}
    />
  );

  return {
    user,
    onAddRequirement,
    onEditMetric,
    onDeleteMilestone,
    onAddJourney,
    onEditMetricSchema,
  };
}

describe("ContentOutlineStep interactions", () => {
  it("collects input when adding a functional requirement", async () => {
    const { user, onAddRequirement } = renderOutlineStep({});

    await user.click(screen.getByRole("button", { name: /add requirement/i }));

    const formRegion = screen
      .getByRole("heading", { name: /add functional requirement/i })
      .closest("div");
    expect(formRegion).not.toBeNull();
    assertIsHTMLElement(formRegion);
    const form = formRegion;

    await user.type(
      within(form).getByLabelText(/title/i),
      "Collaborative editor"
    );
    await user.type(
      within(form).getByLabelText(/description/i),
      "Allow teams to co-edit documents in real time."
    );
    await user.selectOptions(within(form).getByLabelText(/priority/i), "P0");

    await user.click(
      within(form).getByRole("button", { name: /add requirement/i })
    );

    expect(onAddRequirement).toHaveBeenCalledTimes(1);
    expect(onAddRequirement).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Collaborative editor",
        description: "Allow teams to co-edit documents in real time.",
        priority: "P0",
      })
    );
    expect(
      screen.queryByRole("heading", { name: /add functional requirement/i })
    ).toBeNull();
  });

  it("surfaces an inline form for editing success metrics", async () => {
    const metric: SuccessMetric = {
      id: "sm-1",
      name: "Activation",
      description: "Measure weekly activation",
      type: "engagement",
    };

    const outline: ContentOutline = {
      ...baseOutline,
      successMetrics: [metric],
    };

    const { user, onEditMetric } = renderOutlineStep({
      outline,
      onEditMetric: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /edit activation/i }));

    const formRegion = screen
      .getByRole("heading", { name: /edit success metric/i })
      .closest("div");
    expect(formRegion).not.toBeNull();
    assertIsHTMLElement(formRegion);
    const nameField = within(formRegion).getByLabelText(/name/i);
    await user.clear(nameField);
    await user.type(nameField, "Activation Rate");

    await user.click(
      within(formRegion).getByRole("button", { name: /save metric/i })
    );

    expect(onEditMetric).toHaveBeenCalledTimes(1);
    expect(onEditMetric).toHaveBeenCalledWith(
      "sm-1",
      expect.objectContaining({
        id: "sm-1",
        name: "Activation Rate",
        description: metric.description,
      })
    );
  });

  it("calls delete handlers from item cards", async () => {
    const milestone: Milestone = {
      id: "ms-1",
      title: "Launch beta",
      description: "Release the beta to 100 customers",
      phase: "launch",
    };

    const outline: ContentOutline = {
      ...baseOutline,
      milestones: [milestone],
    };

    const onDeleteMilestone = jest.fn();
    const { user } = renderOutlineStep({
      outline,
      onDeleteMilestone,
    });

    await user.click(
      screen.getByRole("button", { name: /delete launch beta/i })
    );

    expect(onDeleteMilestone).toHaveBeenCalledWith("ms-1");
  });

  it("collects input when adding a customer journey", async () => {
    const { user, onAddJourney } = renderOutlineStep({});

    await user.click(screen.getByRole("button", { name: /add journey/i }));

    const formRegion = screen
      .getByRole("heading", { name: /add customer journey/i })
      .closest("div");
    expect(formRegion).not.toBeNull();
    assertIsHTMLElement(formRegion);

    await user.type(
      within(formRegion).getByLabelText(/journey title/i),
      "New Onboarding"
    );
    await user.type(
      within(formRegion).getByLabelText(/persona \/ role/i),
      "First-time admin"
    );
    await user.type(
      within(formRegion).getByLabelText(/persona goal/i),
      "Configure the product for their organization"
    );
    await user.type(
      within(formRegion).getByRole("textbox", { name: /step 1$/i }),
      "Visit the setup wizard"
    );

    await user.click(
      within(formRegion).getByRole("button", { name: /add journey/i })
    );

    expect(onAddJourney).toHaveBeenCalledTimes(1);
    expect(onAddJourney).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Onboarding",
        role: "First-time admin",
        goal: "Configure the product for their organization",
      })
    );
    const typedJourneyMock = onAddJourney as jest.MockedFunction<
      (journey: CustomerJourney) => void
    >;
    const [firstJourneyCall] = typedJourneyMock.mock.calls as
      | [CustomerJourney[]]
      | [];
    expect(firstJourneyCall).toBeDefined();
    if (!firstJourneyCall) {
      throw new Error(
        "Expected a customer journey to be passed to the handler"
      );
    }
    const [journey] = firstJourneyCall;
    expect(journey).toBeDefined();
    if (!journey) {
      throw new Error(
        "Expected a customer journey to be passed to the handler"
      );
    }
    expect(journey.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ description: "Visit the setup wizard" }),
      ])
    );
  });

  it("opens an editor for existing metric schemas", async () => {
    const schema: SuccessMetricSchema = {
      id: "schema-1",
      title: "Activation Signals",
      description: "Track activation milestones",
      fields: [
        {
          id: "field-1",
          name: "Completed onboarding",
          description: "Whether the customer completed onboarding",
          dataType: "boolean",
          required: true,
        },
      ],
    };

    const outline: ContentOutline = {
      ...baseOutline,
      metricSchemas: [schema],
    };

    const { user, onEditMetricSchema } = renderOutlineStep({
      outline,
      onEditMetricSchema: jest.fn(),
    });

    await user.click(
      screen.getByRole("button", { name: /edit activation signals/i })
    );

    const formRegion = screen
      .getByRole("heading", { name: /edit metric schema/i })
      .closest("div");
    expect(formRegion).not.toBeNull();
    assertIsHTMLElement(formRegion);

    const titleField = within(formRegion).getByLabelText(/schema title/i);
    await user.clear(titleField);
    await user.type(titleField, "Activation KPIs");

    await user.click(
      within(formRegion).getByRole("button", { name: /save metric schema/i })
    );

    expect(onEditMetricSchema).toHaveBeenCalledTimes(1);
    expect(onEditMetricSchema).toHaveBeenCalledWith(
      "schema-1",
      expect.objectContaining({ title: "Activation KPIs" })
    );
  });
});
