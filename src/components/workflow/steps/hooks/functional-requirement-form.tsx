import { useCallback, useState, type FormEvent } from "react";

import { Textarea } from "@/components/ui/textarea";
import type { FunctionalRequirement } from "@/types/workflow";

import type {
  EditorMode,
  FunctionalRequirementDraft,
} from "./outline-editor-types";

import {
  FormActionButtons,
  LabeledField,
  baseInputClass,
  formSectionClass,
  sanitizeOptionalField,
} from "./outline-form-shared";

interface FunctionalRequirementFormProps {
  mode: EditorMode;
  initialValues: FunctionalRequirementDraft;
  onCancel: () => void;
  onSubmit: (values: FunctionalRequirementDraft) => void;
}

export function FunctionalRequirementForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: FunctionalRequirementFormProps) {
  const [formState, setFormState] = useState<FunctionalRequirementDraft>(
    () => initialValues
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const userStory = sanitizeOptionalField(formState.userStory);
      const estimatedEffort = sanitizeOptionalField(formState.estimatedEffort);
      onSubmit({
        ...formState,
        title: formState.title.trim(),
        description: formState.description.trim(),
        userStory,
        estimatedEffort,
      });
    },
    [formState, onSubmit]
  );

  const isValid =
    formState.title.trim() !== "" && formState.description.trim() !== "";

  return (
    <form className={formSectionClass} onSubmit={handleSubmit}>
      <LabeledField id="functional-title" label="Title">
        <input
          id="functional-title"
          className={baseInputClass}
          value={formState.title}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, title: event.target.value }))
          }
          required
        />
      </LabeledField>
      <LabeledField id="functional-description" label="Description">
        <Textarea
          id="functional-description"
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
        <LabeledField id="functional-priority" label="Priority">
          <select
            id="functional-priority"
            className={baseInputClass}
            value={formState.priority ?? "P1"}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                priority: event.target
                  .value as FunctionalRequirement["priority"],
              }))
            }
          >
            <option value="P0">P0 - Critical</option>
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Nice to have</option>
          </select>
        </LabeledField>
        <LabeledField id="functional-effort" label="Estimated Effort">
          <input
            id="functional-effort"
            className={baseInputClass}
            value={formState.estimatedEffort ?? ""}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                estimatedEffort: event.target.value,
              }))
            }
            placeholder="e.g., 3 sprints"
          />
        </LabeledField>
      </div>
      <LabeledField
        id="functional-story"
        label="User Story"
        hint="Optional narrative that frames the requirement from the user's point of view."
      >
        <Textarea
          id="functional-story"
          value={formState.userStory ?? ""}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, userStory: event.target.value }))
          }
          placeholder="As a user, I want..."
        />
      </LabeledField>
      <FormActionButtons
        mode={mode}
        createLabel="Add Requirement"
        editLabel="Save Requirement"
        onCancel={onCancel}
        submitDisabled={!isValid}
      />
    </form>
  );
}
