import { useCallback, useMemo } from "react";

import { MetricFieldsSection } from "@/lib/workflow/metric-fields-section";

import {
  ensureFieldDrafts,
  normalizeMetricField,
} from "@/lib/workflow/metric-schema-utils";

import type {
  EditorMode,
  SuccessMetricSchemaDraft,
} from "@/lib/workflow/outline-editor-types";

import { textField, textareaField } from "@/lib/workflow/outline-form-fields";
import { formSectionClass } from "@/lib/workflow/outline-form-shared";

import { useOutlineDraftForm } from "./use-outline-draft-form";
import type { OutlineDraftRenderArgs } from "./use-outline-draft-form";

interface MetricSchemaFormProps {
  mode: EditorMode;
  initialValues: SuccessMetricSchemaDraft;
  onCancel: () => void;
  onSubmit: (values: SuccessMetricSchemaDraft) => void;
}

export function MetricSchemaForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: MetricSchemaFormProps) {
  const initialDraft = useMemo(
    () => ({
      ...initialValues,
      fields: ensureFieldDrafts(initialValues.fields),
    }),
    [initialValues]
  );

  const sections = useMemo(
    () => [
      {
        kind: "field" as const,
        field: textField<SuccessMetricSchemaDraft>({
          id: "schema-title",
          label: "Schema Title",
          path: "title",
          required: true,
        }),
      },
      {
        kind: "field" as const,
        field: textareaField<SuccessMetricSchemaDraft>({
          id: "schema-description",
          label: "Description",
          path: "description",
          required: true,
          hint: "Describe the overall purpose of this metric schema",
        }),
      },
      {
        kind: "custom" as const,
        id: "schema-fields",
        render: (args: OutlineDraftRenderArgs<SuccessMetricSchemaDraft>) => (
          <div className={formSectionClass}>
            <MetricFieldsSection {...args} />
          </div>
        ),
        prepare: (draft: SuccessMetricSchemaDraft) => ({
          ...draft,
          fields: draft.fields
            .map((field) => normalizeMetricField(field))
            .filter(
              (field) => field.name.length > 0 && field.description.length > 0
            ),
        }),
      },
    ],
    []
  );

  const validate = useCallback(
    (draft: SuccessMetricSchemaDraft) =>
      draft.title.length > 0 &&
      draft.description.length > 0 &&
      draft.fields.length > 0,
    []
  );

  const { Form } = useOutlineDraftForm({
    mode,
    initialValues: initialDraft,
    onCancel,
    onSubmit,
    submitLabels: {
      create: "Add Metric Schema",
      edit: "Save Metric Schema",
    },
    sections,
    validate,
  });

  return Form;
}
