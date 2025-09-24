import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";

import { MetricFieldEditor } from "./metric-field-editor";

import {
  createDefaultMetricField,
  ensureFieldDrafts,
  normalizeMetricField,
} from "./metric-schema-utils";

import type {
  EditorMode,
  SuccessMetricFieldDraft,
  SuccessMetricSchemaDraft,
} from "./outline-editor-types";

import { textField, textareaField } from "./outline-form-fields";
import { formSectionClass } from "./outline-form-shared";

import {
  useOutlineDraftForm,
  type OutlineDraftRenderArgs,
} from "./use-outline-draft-form";

interface MetricSchemaFormProps {
  mode: EditorMode;
  initialValues: SuccessMetricSchemaDraft;
  onCancel: () => void;
  onSubmit: (values: SuccessMetricSchemaDraft) => void;
}

function MetricFieldsSection({
  formState,
  setFormState,
}: OutlineDraftRenderArgs<SuccessMetricSchemaDraft>) {
  const updateField = useCallback(
    <Key extends keyof SuccessMetricFieldDraft>(
      index: number,
      key: Key,
      value: SuccessMetricFieldDraft[Key]
    ) => {
      setFormState((prev) => ({
        ...prev,
        fields: prev.fields.map((field, fieldIndex) => {
          if (fieldIndex !== index) {
            return field;
          }

          if (key === "dataType") {
            return {
              ...field,
              dataType: value as SuccessMetricFieldDraft["dataType"],
              allowedValues: [],
            };
          }

          return {
            ...field,
            [key]: value,
          } as SuccessMetricFieldDraft;
        }),
      }));
    },
    [setFormState]
  );

  const handleAddField = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      fields: [...prev.fields, createDefaultMetricField()],
    }));
  }, [setFormState]);

  const handleRemoveField = useCallback(
    (index: number) => {
      setFormState((prev) => ({
        ...prev,
        fields: ensureFieldDrafts(
          prev.fields.filter((_, fieldIndex) => fieldIndex !== index)
        ),
      }));
    },
    [setFormState]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Schema Fields</h4>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddField}
        >
          Add Field
        </Button>
      </div>
      {formState.fields.map((field, index) => (
        <MetricFieldEditor
          key={field.id ?? `field-${index}`}
          field={field}
          index={index}
          onChange={updateField}
          onRemove={handleRemoveField}
        />
      ))}
    </div>
  );
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
