import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import type { OutlineDraftRenderArgs } from "@/workflow/forms/use-outline-draft-form";

import { MetricFieldEditor } from "./metric-field-editor";

import {
  createDefaultMetricField,
  ensureFieldDrafts,
} from "./metric-schema-utils";

import type {
  SuccessMetricFieldDraft,
  SuccessMetricSchemaDraft,
} from "./outline-editor-types";

export function MetricFieldsSection({
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
          };
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
