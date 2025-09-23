import { useCallback, useState, type FormEvent } from "react";

import { Textarea } from "@/components/ui/textarea";
import type { Milestone } from "@/types/workflow";

import type { EditorMode, MilestoneDraft } from "./outline-editor-types";

import {
  FormActionButtons,
  LabeledField,
  baseInputClass,
  formSectionClass,
  sanitizeOptionalField,
} from "./outline-form-shared";

interface MilestoneFormProps {
  mode: EditorMode;
  initialValues: MilestoneDraft;
  onCancel: () => void;
  onSubmit: (values: MilestoneDraft) => void;
}

export function MilestoneForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: MilestoneFormProps) {
  const [formState, setFormState] = useState<MilestoneDraft>(
    () => initialValues
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const estimatedDate = sanitizeOptionalField(formState.estimatedDate);
      onSubmit({
        ...formState,
        title: formState.title.trim(),
        description: formState.description.trim(),
        estimatedDate,
      });
    },
    [formState, onSubmit]
  );

  const isValid =
    formState.title.trim() !== "" && formState.description.trim() !== "";

  return (
    <form className={formSectionClass} onSubmit={handleSubmit}>
      <LabeledField id="milestone-title" label="Title">
        <input
          id="milestone-title"
          className={baseInputClass}
          value={formState.title}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, title: event.target.value }))
          }
          required
        />
      </LabeledField>
      <LabeledField id="milestone-description" label="Description">
        <Textarea
          id="milestone-description"
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
        <LabeledField id="milestone-phase" label="Phase">
          <select
            id="milestone-phase"
            className={baseInputClass}
            value={formState.phase ?? "development"}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                phase: event.target.value as Milestone["phase"],
              }))
            }
          >
            <option value="research">Research</option>
            <option value="design">Design</option>
            <option value="development">Development</option>
            <option value="testing">Testing</option>
            <option value="launch">Launch</option>
            <option value="post-launch">Post-launch</option>
          </select>
        </LabeledField>
        <LabeledField
          id="milestone-date"
          label="Estimated Date"
          hint="Optional target date for delivery."
        >
          <input
            id="milestone-date"
            type="date"
            className={baseInputClass}
            value={formState.estimatedDate ?? ""}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                estimatedDate: event.target.value,
              }))
            }
          />
        </LabeledField>
      </div>
      <FormActionButtons
        mode={mode}
        createLabel="Add Milestone"
        editLabel="Save Milestone"
        onCancel={onCancel}
        submitDisabled={!isValid}
      />
    </form>
  );
}
