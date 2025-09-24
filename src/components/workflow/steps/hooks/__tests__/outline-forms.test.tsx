/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { CustomerJourneyForm } from "../customer-journey-form";
import { FunctionalRequirementForm } from "../functional-requirement-form";
import { MetricSchemaForm } from "../metric-schema-form";
import { MilestoneForm } from "../milestone-form";

import type {
  CustomerJourneyDraft,
  FunctionalRequirementDraft,
  MetricSchemaDraft,
  MilestoneDraft,
  SuccessMetricDraft,
} from "../outline-editor-types";

import { SuccessMetricForm } from "../success-metric-form";

const noop = () => undefined;

// Ensure React runtime is available for classic JSX transform used by Jest
(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe("workflow outline forms", () => {
  it("sanitises functional requirement submission while enforcing validation", async () => {
    const onSubmit = jest.fn();
    const initialValues: FunctionalRequirementDraft = {
      title: "",
      description: "",
      priority: "P1",
      userStory: "",
      acceptanceCriteria: [],
      dependencies: [],
      estimatedEffort: "",
    };

    render(
      <FunctionalRequirementForm
        mode="create"
        initialValues={initialValues}
        onCancel={noop}
        onSubmit={onSubmit}
      />
    );

    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", {
      name: "Add Requirement",
    });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Title"), "  Payment flow  ");
    await user.type(
      screen.getByLabelText("Description"),
      "  Should process payments securely  "
    );
    await user.type(
      screen.getByLabelText("User Story"),
      "  As a user, I want secure checkout  "
    );
    await user.type(screen.getByLabelText("Estimated Effort"), "   ");

    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as FunctionalRequirementDraft;
    expect(submitted.title).toBe("Payment flow");
    expect(submitted.description).toBe("Should process payments securely");
    expect(submitted.userStory).toBe("As a user, I want secure checkout");
    expect(submitted.estimatedEffort).toBeUndefined();
  });

  it("normalises success metric input fields on submit", async () => {
    const onSubmit = jest.fn();
    const initialValues: SuccessMetricDraft = {
      name: "",
      description: "",
      type: "engagement",
      target: "",
      measurement: "",
      frequency: "",
      owner: "",
    };

    render(
      <SuccessMetricForm
        mode="create"
        initialValues={initialValues}
        onCancel={noop}
        onSubmit={onSubmit}
      />
    );

    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: "Add Metric" });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Name"), "  Time to provision  ");
    await user.type(
      screen.getByLabelText("Description"),
      "  Tracks time from request to live tenant  "
    );
    await user.selectOptions(screen.getByLabelText("Type"), "performance");
    await user.type(screen.getByLabelText("Target"), "  < 10 minutes  ");
    await user.type(screen.getByLabelText("Measurement Method"), "   ");
    await user.type(screen.getByLabelText("Owner"), "  Platform lead  ");
    await user.type(screen.getByLabelText("Review Frequency"), "  weekly  ");

    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as SuccessMetricDraft;
    expect(submitted.name).toBe("Time to provision");
    expect(submitted.description).toBe(
      "Tracks time from request to live tenant"
    );
    expect(submitted.type).toBe("performance");
    expect(submitted.target).toBe("< 10 minutes");
    expect(submitted.measurement).toBeUndefined();
    expect(submitted.owner).toBe("Platform lead");
    expect(submitted.frequency).toBe("weekly");
  });

  it("trims milestone values and removes blank optional dates", async () => {
    const onSubmit = jest.fn();
    const initialValues: MilestoneDraft = {
      title: "",
      description: "",
      phase: "development",
      estimatedDate: "",
      dependencies: [],
      deliverables: [],
    };

    render(
      <MilestoneForm
        mode="create"
        initialValues={initialValues}
        onCancel={noop}
        onSubmit={onSubmit}
      />
    );

    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: "Add Milestone" });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Title"), "  Launch automation  ");
    await user.type(
      screen.getByLabelText("Description"),
      "  Deploy provisioning automation globally  "
    );
    await user.selectOptions(screen.getByLabelText("Phase"), "launch");
    const dateInput = screen.getByLabelText("Estimated Date");
    await user.type(dateInput, "2024-05-01");
    await user.clear(dateInput);

    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as MilestoneDraft;
    expect(submitted.title).toBe("Launch automation");
    expect(submitted.description).toBe(
      "Deploy provisioning automation globally"
    );
    expect(submitted.phase).toBe("launch");
    expect(submitted.estimatedDate).toBeUndefined();
  });

  it("produces trimmed customer journey drafts with filtered steps", async () => {
    const onSubmit = jest.fn();
    const initialValues: CustomerJourneyDraft = {
      title: "",
      role: "",
      goal: "",
      successCriteria: "",
      steps: [],
      painPoints: [],
    };

    render(
      <CustomerJourneyForm
        mode="create"
        initialValues={initialValues}
        onCancel={noop}
        onSubmit={onSubmit}
      />
    );

    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: "Add Journey" });
    expect(submitButton).toBeDisabled();

    await user.type(
      screen.getByLabelText("Journey Title"),
      "  Approve automation  "
    );
    await user.type(screen.getByLabelText("Persona / Role"), "  IT admin  ");
    await user.type(
      screen.getByLabelText("Persona Goal"),
      "  Approve provisioning rollout  "
    );
    await user.type(
      screen.getByLabelText("Success Criteria"),
      "  Monitoring configured  "
    );
    await user.type(screen.getByLabelText("Step 1"), "  Review proposal  ");
    await user.type(
      screen.getByLabelText("Pain Points"),
      "  Approval delays  \n  \n  Limited visibility  "
    );

    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as CustomerJourneyDraft;
    expect(submitted.title).toBe("Approve automation");
    expect(submitted.role).toBe("IT admin");
    expect(submitted.goal).toBe("Approve provisioning rollout");
    expect(submitted.successCriteria).toBe("Monitoring configured");
    expect(submitted.steps).toHaveLength(1);
    expect(submitted.steps[0]?.description).toBe("Review proposal");
    expect(submitted.painPoints).toEqual([
      "Approval delays",
      "Limited visibility",
    ]);
  });

  it("sanitises metric schema fields and allowed values", async () => {
    const onSubmit = jest.fn();
    const initialValues: MetricSchemaDraft = {
      title: "",
      description: "",
      fields: [
        {
          id: undefined,
          name: "",
          description: "",
          dataType: "string",
          required: false,
          allowedValues: [],
          sourceSystem: "",
        },
      ],
    };

    render(
      <MetricSchemaForm
        mode="create"
        initialValues={initialValues}
        onCancel={noop}
        onSubmit={onSubmit}
      />
    );

    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", {
      name: "Add Metric Schema",
    });
    expect(submitButton).toBeDisabled();

    await user.type(
      screen.getByLabelText("Schema Title"),
      "  Provisioning metrics  "
    );
    await user.type(
      screen.getByLabelText("Description"),
      "  Defines provisioning health indicators  "
    );
    await user.type(
      screen.getByLabelText("Field Name"),
      "  Provisioning status  "
    );
    await user.type(
      screen.getByLabelText("Field Description"),
      "  Current provisioning state  "
    );
    await user.selectOptions(screen.getByLabelText("Data Type"), "enum");
    await user.click(screen.getByLabelText("Required"));
    await user.type(screen.getByLabelText("Source System"), "  Snowflake  ");
    const allowedValuesField = screen.getByLabelText("Allowed Values");
    fireEvent.change(allowedValuesField, {
      target: { value: "  Active  \n  \n  Paused  " },
    });

    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as MetricSchemaDraft;
    expect(submitted.title).toBe("Provisioning metrics");
    expect(submitted.description).toBe(
      "Defines provisioning health indicators"
    );
    expect(submitted.fields).toHaveLength(1);
    expect(submitted.fields[0]).toMatchObject({
      name: "Provisioning status",
      description: "Current provisioning state",
      dataType: "enum",
      required: true,
      allowedValues: ["Active", "Paused"],
      sourceSystem: "Snowflake",
    });
  });
});
