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
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
} from "@/types/workflow";

import { ContentOutlineStep } from "../content-outline-step";

const baseOutline: ContentOutline = {
  functionalRequirements: [],
  successMetrics: [],
  milestones: [],
};

function renderOutlineStep(options: {
  outline?: ContentOutline;
  onAddRequirement?: (requirement: FunctionalRequirement) => void;
  onEditMetric?: (id: string, metric: Partial<SuccessMetric>) => void;
  onDeleteMilestone?: (id: string) => void;
}) {
  const user = userEvent.setup();
  const outline = options.outline ?? baseOutline;
  const onAddRequirement = options.onAddRequirement ?? jest.fn();
  const onEditMetric = options.onEditMetric ?? jest.fn();
  const onDeleteMilestone = options.onDeleteMilestone ?? jest.fn();

  render(
    <ContentOutlineStep
      initialPrompt=""
      contentOutline={outline}
      onChange={jest.fn()}
      onRegenerateOutline={jest.fn()}
      onAddFunctionalRequirement={onAddRequirement}
      onEditSuccessMetric={onEditMetric}
      onDeleteMilestone={onDeleteMilestone}
    />
  );

  return { user, onAddRequirement, onEditMetric, onDeleteMilestone };
}

describe("ContentOutlineStep interactions", () => {
  it("collects input when adding a functional requirement", async () => {
    const { user, onAddRequirement } = renderOutlineStep({});

    await user.click(screen.getByRole("button", { name: /add requirement/i }));

    const formRegion = screen
      .getByRole("heading", { name: /add functional requirement/i })
      .closest("div");
    expect(formRegion).toBeInTheDocument();
    const form = formRegion!;

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
    ).not.toBeInTheDocument();
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
    expect(formRegion).toBeInTheDocument();
    const nameField = within(formRegion!).getByLabelText(/name/i);
    await user.clear(nameField);
    await user.type(nameField, "Activation Rate");

    await user.click(
      within(formRegion!).getByRole("button", { name: /save metric/i })
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
});
