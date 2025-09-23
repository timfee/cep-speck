import { useCallback, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type {
  EditorMode,
  SuccessMetricFieldDraft,
  SuccessMetricSchemaDraft,
} from "./outline-editor-types";

import {
  FormActionButtons,
  LabeledField,
  baseInputClass,
  formSectionClass,
  sanitizeOptionalField,
} from "./outline-form-shared";

interface MetricSchemaFormProps {
  mode: EditorMode;
  initialValues: SuccessMetricSchemaDraft;
  onCancel: () => void;
  onSubmit: (values: SuccessMetricSchemaDraft) => void;
}

const ensureFieldDrafts = (fields: SuccessMetricFieldDraft[]) =>
  fields.length > 0
    ? fields
    : [
        {
          id: undefined,
          name: "",
          description: "",
          dataType: "string" as SuccessMetricFieldDraft["dataType"],
          required: false,
          allowedValues: [],
        },
      ];

const parseAllowedValues = (value: string) =>
  value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

export function MetricSchemaForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: MetricSchemaFormProps) {
  const [formState, setFormState] = useState<SuccessMetricSchemaDraft>(() => ({
    ...initialValues,
    fields: ensureFieldDrafts(initialValues.fields),
  }));

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
    []
  );

  const handleAddField = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id: undefined,
          name: "",
          description: "",
          dataType: "string",
          required: false,
          allowedValues: [],
        },
      ],
    }));
  }, []);

  const handleRemoveField = useCallback((index: number) => {
    setFormState((prev) => {
      const nextFields = prev.fields.filter(
        (_, fieldIndex) => fieldIndex !== index
      );
      return {
        ...prev,
        fields: ensureFieldDrafts(nextFields),
      };
    });
  }, []);

  const trimmedFields = useMemo(
    () =>
      formState.fields
        .map((field) => ({
          ...field,
          name: field.name.trim(),
          description: field.description.trim(),
          allowedValues: (field.allowedValues ?? [])
            .map((value) => value.trim())
            .filter((value) => value.length > 0),
          sourceSystem: sanitizeOptionalField(field.sourceSystem),
        }))
        .filter(
          (field) => field.name.length > 0 && field.description.length > 0
        ),
    [formState.fields]
  );

  const isValid =
    formState.title.trim() !== "" &&
    formState.description.trim() !== "" &&
    trimmedFields.length > 0;

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
        {formState.fields.map((field, index) => {
          const fieldId = field.id ?? `field-${index}`;
          const allowedValuesText = (field.allowedValues ?? []).join("\n");
          return (
            <div key={fieldId} className="rounded-md border p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <LabeledField id={`field-name-${index}`} label="Field Name">
                    <input
                      id={`field-name-${index}`}
                      className={baseInputClass}
                      value={field.name}
                      onChange={(event) =>
                        updateField(index, "name", event.target.value)
                      }
                      required
                    />
                  </LabeledField>
                  <LabeledField
                    id={`field-description-${index}`}
                    label="Field Description"
                  >
                    <Textarea
                      id={`field-description-${index}`}
                      value={field.description}
                      onChange={(event) =>
                        updateField(index, "description", event.target.value)
                      }
                      required
                    />
                  </LabeledField>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveField(index)}
                  aria-label={`Remove field ${index + 1}`}
                >
                  ×
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <LabeledField id={`field-type-${index}`} label="Data Type">
                  <select
                    id={`field-type-${index}`}
                    className={baseInputClass}
                    value={field.dataType ?? "string"}
                    onChange={(event) =>
                      updateField(
                        index,
                        "dataType",
                        event.target
                          .value as SuccessMetricFieldDraft["dataType"]
                      )
                    }
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                    <option value="boolean">Boolean</option>
                    <option value="enum">Enum</option>
                  </select>
                </LabeledField>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    id={`field-required-${index}`}
                    type="checkbox"
                    checked={field.required ?? false}
                    onChange={(event) =>
                      updateField(index, "required", event.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`field-required-${index}`}
                    className="text-sm"
                  >
                    Required
                  </label>
                </div>
                <LabeledField
                  id={`field-source-${index}`}
                  label="Source System"
                  hint="Optional system or owner for this metric"
                >
                  <input
                    id={`field-source-${index}`}
                    className={baseInputClass}
                    value={field.sourceSystem ?? ""}
                    onChange={(event) =>
                      updateField(index, "sourceSystem", event.target.value)
                    }
                    placeholder="e.g., Snowflake, Amplitude"
                  />
                </LabeledField>
              </div>
              {field.dataType === "enum" ? (
                <LabeledField
                  id={`field-allowed-values-${index}`}
                  label="Allowed Values"
                  hint="List permitted values (one per line)"
                >
                  <Textarea
                    id={`field-allowed-values-${index}`}
                    value={allowedValuesText}
                    onChange={(event) =>
                      updateField(
                        index,
                        "allowedValues",
                        parseAllowedValues(event.target.value)
                      )
                    }
                    placeholder="Free, Pro, Enterprise"
                  />
                </LabeledField>
              ) : null}
            </div>
          );
        })}
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
