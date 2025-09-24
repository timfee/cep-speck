import { useCallback, useMemo } from "react";

import type {
  EditorMode,
  SuccessMetricDraft,
} from "@/lib/workflow/outline-editor-types";

import {
  METRIC_TYPE_OPTIONS,
  optionalTextField,
  selectField,
  textField,
  textareaField,
} from "@/lib/workflow/outline-form-fields";

import { useOutlineDraftForm } from "./use-outline-draft-form";

interface SuccessMetricFormProps {
  mode: EditorMode;
  initialValues: SuccessMetricDraft;
  onCancel: () => void;
  onSubmit: (values: SuccessMetricDraft) => void;
}

export function SuccessMetricForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: SuccessMetricFormProps) {
  const sections = useMemo(
    () => [
      {
        kind: "field" as const,
        field: textField<SuccessMetricDraft>({
          id: "metric-name",
          label: "Name",
          path: "name",
          required: true,
        }),
      },
      {
        kind: "field" as const,
        field: textareaField<SuccessMetricDraft>({
          id: "metric-description",
          label: "Description",
          path: "description",
          required: true,
        }),
      },
      {
        kind: "group" as const,
        id: "metric-primary",
        className: "grid gap-4 md:grid-cols-2",
        fields: [
          selectField<SuccessMetricDraft>({
            id: "metric-type",
            label: "Type",
            path: "type",
            options: METRIC_TYPE_OPTIONS,
          }),
          optionalTextField<SuccessMetricDraft>({
            id: "metric-target",
            label: "Target",
            path: "target",
            hint: "Optional goal to define success (e.g., 30% increase).",
            placeholder: "e.g., 30% increase",
          }),
        ],
      },
      {
        kind: "group" as const,
        id: "metric-secondary",
        className: "grid gap-4 md:grid-cols-2",
        fields: [
          optionalTextField<SuccessMetricDraft>({
            id: "metric-measurement",
            label: "Measurement Method",
            path: "measurement",
            hint: "Describe how progress will be tracked.",
            placeholder: "e.g., Weekly dashboards",
          }),
          optionalTextField<SuccessMetricDraft>({
            id: "metric-owner",
            label: "Owner",
            path: "owner",
            placeholder: "e.g., Growth PM",
          }),
        ],
      },
      {
        kind: "field" as const,
        field: optionalTextField<SuccessMetricDraft>({
          id: "metric-frequency",
          label: "Review Frequency",
          path: "frequency",
          placeholder: "e.g., Monthly",
        }),
      },
    ],
    []
  );

  const validate = useCallback(
    (draft: SuccessMetricDraft) =>
      draft.name.length > 0 && draft.description.length > 0,
    []
  );

  const { Form } = useOutlineDraftForm({
    mode,
    initialValues,
    onCancel,
    onSubmit,
    submitLabels: {
      create: "Add Metric",
      edit: "Save Metric",
    },
    sections,
    validate,
  });

  return Form;
}
