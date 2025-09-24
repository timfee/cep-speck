/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import {
  optionalTextareaField,
  selectField,
  textField,
} from "../outline-form-fields";

import { useOutlineDraftForm } from "../use-outline-draft-form";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe("useOutlineDraftForm", () => {
  it("trims text inputs and normalises optional textarea fields", async () => {
    const onSubmit = jest.fn();

    type TestDraft = {
      name: string;
      notes?: string;
      category: string;
    };

    function TestForm() {
      const { Form } = useOutlineDraftForm({
        mode: "create",
        initialValues: {
          name: "",
          notes: "",
          category: "alpha",
        },
        onCancel: jest.fn(),
        onSubmit,
        submitLabels: {
          create: "Create Item",
          edit: "Save Item",
        },
        sections: [
          {
            kind: "field" as const,
            field: textField<TestDraft>({
              id: "test-name",
              label: "Name",
              path: "name",
              required: true,
            }),
          },
          {
            kind: "field" as const,
            field: optionalTextareaField<TestDraft>({
              id: "test-notes",
              label: "Notes",
              path: "notes",
            }),
          },
          {
            kind: "field" as const,
            field: selectField<TestDraft>({
              id: "test-category",
              label: "Category",
              path: "category",
              options: [
                { value: "alpha", label: "Alpha" },
                { value: "beta", label: "Beta" },
              ],
            }),
          },
        ],
        validate: (draft) => draft.name.length > 0,
      });

      return <>{Form}</>;
    }

    render(<TestForm />);
    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: "Create Item" });

    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Name"), "  Example Item  ");
    await user.type(screen.getByLabelText("Notes"), "   ");

    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Example Item",
      notes: undefined,
      category: "alpha",
    });
  });
});
