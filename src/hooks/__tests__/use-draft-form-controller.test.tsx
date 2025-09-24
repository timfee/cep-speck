/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import { act, renderHook } from "@testing-library/react";

import { useDraftFormController } from "../use-draft-form-controller";

describe("useDraftFormController", () => {
  it("trims success metric text fields and normalises optional inputs", () => {
    const onSubmit = jest.fn();

    type SuccessMetricDraft = {
      name: string;
      description: string;
      type: string;
      measurement?: string;
      owner?: string;
    };

    const { result } = renderHook(() =>
      useDraftFormController<SuccessMetricDraft>({
        initialValues: {
          name: "",
          description: "",
          type: "leading",
          measurement: "",
          owner: "",
        },
        fields: [
          { path: "name" },
          { path: "description" },
          { path: "type", trim: false },
          { path: "measurement", optional: true },
          { path: "owner", optional: true },
        ],
        onSubmit,
        validate: (draft) =>
          draft.name.length > 0 && draft.description.length > 0,
      })
    );

    act(() => {
      result.current.updateField("name", "  Activation Rate  ");
      result.current.updateField(
        "description",
        "  Measures onboarding engagement  "
      );
      result.current.updateField("measurement", "   ");
    });

    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Activation Rate",
      description: "Measures onboarding engagement",
      type: "leading",
      measurement: undefined,
      owner: undefined,
    });
  });

  it("retains select values while trimming and sanitising milestone drafts", () => {
    const onSubmit = jest.fn();

    type MilestoneDraft = {
      title: string;
      description: string;
      phase: string;
      estimatedDate?: string;
    };

    const { result } = renderHook(() =>
      useDraftFormController<MilestoneDraft>({
        initialValues: {
          title: "",
          description: "",
          phase: "discover",
          estimatedDate: "   ",
        },
        fields: [
          { path: "title" },
          { path: "description" },
          { path: "phase", trim: false },
          { path: "estimatedDate", optional: true },
        ],
        onSubmit,
      })
    );

    act(() => {
      result.current.updateField("title", "  Kickoff Workshop  ");
      result.current.updateField(
        "description",
        "  Align stakeholders on scope  "
      );
      result.current.updateField("phase", "plan ");
      result.current.updateField("estimatedDate", " 2025-01-01  ");
    });

    expect(result.current.preparedDraft).toEqual({
      title: "Kickoff Workshop",
      description: "Align stakeholders on scope",
      phase: "plan ",
      estimatedDate: "2025-01-01",
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Kickoff Workshop",
      description: "Align stakeholders on scope",
      phase: "plan ",
      estimatedDate: "2025-01-01",
    });
  });
});
