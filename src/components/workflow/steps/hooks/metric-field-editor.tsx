"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type { SuccessMetricFieldDraft } from "./outline-editor-types";
import { LabeledField, baseInputClass } from "./outline-form-shared";

export type MetricFieldUpdateHandler = <
  Key extends keyof SuccessMetricFieldDraft,
>(
  index: number,
  key: Key,
  value: SuccessMetricFieldDraft[Key]
) => void;

interface MetricFieldEditorProps {
  field: SuccessMetricFieldDraft;
  index: number;
  onChange: MetricFieldUpdateHandler;
  onRemove: (index: number) => void;
}

const parseAllowedValues = (value: string) =>
  value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

export function MetricFieldEditor({
  field,
  index,
  onChange,
  onRemove,
}: MetricFieldEditorProps) {
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
              onChange={(event) => onChange(index, "name", event.target.value)}
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
                onChange(index, "description", event.target.value)
              }
              required
            />
          </LabeledField>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => onRemove(index)}
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
              onChange(
                index,
                "dataType",
                event.target.value as SuccessMetricFieldDraft["dataType"]
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
              onChange(index, "required", event.target.checked)
            }
            className="h-4 w-4"
          />
          <label htmlFor={`field-required-${index}`} className="text-sm">
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
              onChange(index, "sourceSystem", event.target.value)
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
              onChange(
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
}
