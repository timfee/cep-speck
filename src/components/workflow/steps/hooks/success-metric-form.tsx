import { useCallback, useState, type FormEvent } from "react";

import { Textarea } from "@/components/ui/textarea";
import type { SuccessMetric } from "@/types/workflow";

import type { EditorMode, SuccessMetricDraft } from "./outline-editor-types";

import {
  FormActionButtons,
  LabeledField,
  baseInputClass,
  formSectionClass,
  sanitizeOptionalField,
} from "./outline-form-shared";

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
  const [formState, setFormState] = useState<SuccessMetricDraft>(
    () => initialValues
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const target = sanitizeOptionalField(formState.target);
      const measurement = sanitizeOptionalField(formState.measurement);
      const frequency = sanitizeOptionalField(formState.frequency);
      const owner = sanitizeOptionalField(formState.owner);
      onSubmit({
        ...formState,
        name: formState.name.trim(),
        description: formState.description.trim(),
        target,
        measurement,
        frequency,
        owner,
      });
    },
    [formState, onSubmit]
  );

  const isValid =
    formState.name.trim() !== "" && formState.description.trim() !== "";

  return (
    <form className={formSectionClass} onSubmit={handleSubmit}>
      <LabeledField id="metric-name" label="Name">
        <input
          id="metric-name"
          className={baseInputClass}
          value={formState.name}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, name: event.target.value }))
          }
          required
        />
      </LabeledField>
      <LabeledField id="metric-description" label="Description">
        <Textarea
          id="metric-description"
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
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledField id="metric-type" label="Type">
          <select
            id="metric-type"
            className={baseInputClass}
            value={formState.type ?? "engagement"}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                type: event.target.value as SuccessMetric["type"],
              }))
            }
          >
            <option value="engagement">Engagement</option>
            <option value="adoption">Adoption</option>
            <option value="performance">Performance</option>
            <option value="business">Business</option>
          </select>
        </LabeledField>
        <LabeledField
          id="metric-target"
          label="Target"
          hint="Optional goal to define success (e.g., 30% increase)."
        >
          <input
            id="metric-target"
            className={baseInputClass}
            value={formState.target ?? ""}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, target: event.target.value }))
            }
            placeholder="e.g., 30% increase"
          />
        </LabeledField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledField
          id="metric-measurement"
          label="Measurement Method"
          hint="Describe how progress will be tracked."
        >
          <input
            id="metric-measurement"
            className={baseInputClass}
            value={formState.measurement ?? ""}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                measurement: event.target.value,
              }))
            }
            placeholder="e.g., Weekly dashboards"
          />
        </LabeledField>
        <LabeledField id="metric-owner" label="Owner">
          <input
            id="metric-owner"
            className={baseInputClass}
            value={formState.owner ?? ""}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, owner: event.target.value }))
            }
            placeholder="e.g., Growth PM"
          />
        </LabeledField>
      </div>
      <LabeledField id="metric-frequency" label="Review Frequency">
        <input
          id="metric-frequency"
          className={baseInputClass}
          value={formState.frequency ?? ""}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, frequency: event.target.value }))
          }
          placeholder="e.g., Monthly"
        />
      </LabeledField>
      <FormActionButtons
        mode={mode}
        createLabel="Add Metric"
        editLabel="Save Metric"
        onCancel={onCancel}
        submitDisabled={!isValid}
      />
    </form>
  );
}
