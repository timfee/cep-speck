import { useCallback, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { MetricFieldEditor } from "./metric-field-editor";
import { useMetricSchemaState } from "./metric-schema-form-state";

import type {
  EditorMode,
  SuccessMetricSchemaDraft,
} from "./outline-editor-types";

import {
  FormActionButtons,
  LabeledField,
  baseInputClass,
  formSectionClass,
} from "./outline-form-shared";

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
  const {
    formState,
    setFormState,
    updateField,
    handleAddField,
    handleRemoveField,
    trimmedFields,
    isValid,
  } = useMetricSchemaState(initialValues);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit({
        ...formState,
        title: formState.title.trim(),
        description: formState.description.trim(),
        fields: trimmedFields,
      });
    },
    [formState, onSubmit, trimmedFields]
  );

  return (
    <form className={formSectionClass} onSubmit={handleSubmit}>
      <LabeledField id="schema-title" label="Schema Title">
        <input
          id="schema-title"
          className={baseInputClass}
          value={formState.title}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, title: event.target.value }))
          }
          required
        />
      </LabeledField>
      <LabeledField
        id="schema-description"
        label="Description"
        hint="Describe the overall purpose of this metric schema"
      >
        <Textarea
          id="schema-description"
          value={formState.description}
          onChange={(event) =>
            setFormState((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
          required
        />
      </LabeledField>
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
      <FormActionButtons
        mode={mode}
        createLabel="Add Metric Schema"
        editLabel="Save Metric Schema"
        onCancel={onCancel}
        submitDisabled={!isValid}
      />
    </form>
  );
}
