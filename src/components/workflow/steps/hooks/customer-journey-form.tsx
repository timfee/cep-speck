import { useCallback, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type {
  CustomerJourneyDraft,
  CustomerJourneyStepDraft,
  EditorMode,
} from "./outline-editor-types";

import {
  FormActionButtons,
  LabeledField,
  baseInputClass,
  formSectionClass,
  sanitizeOptionalField,
} from "./outline-form-shared";

interface CustomerJourneyFormProps {
  mode: EditorMode;
  initialValues: CustomerJourneyDraft;
  onCancel: () => void;
  onSubmit: (values: CustomerJourneyDraft) => void;
}

const toPainPointText = (points: string[] | undefined) =>
  (points ?? []).join("\n");

const parsePainPoints = (value: string) =>
  value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const ensureStepDrafts = (steps: CustomerJourneyStepDraft[]) =>
  steps.length > 0
    ? steps
    : [
        {
          id: undefined,
          description: "",
        },
      ];

export function CustomerJourneyForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: CustomerJourneyFormProps) {
  const [formState, setFormState] = useState<CustomerJourneyDraft>(() => ({
    ...initialValues,
    steps: ensureStepDrafts(initialValues.steps),
    painPoints: initialValues.painPoints ?? [],
  }));
  const [painPointsText, setPainPointsText] = useState(() =>
    toPainPointText(initialValues.painPoints)
  );

  const handleStepChange = useCallback((index: number, value: string) => {
    setFormState((prev) => ({
      ...prev,
      steps: prev.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, description: value } : step
      ),
    }));
  }, []);

  const handleAddStep = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      steps: [...prev.steps, { id: undefined, description: "" }],
    }));
  }, []);

  const handleRemoveStep = useCallback((index: number) => {
    setFormState((prev) => {
      const nextSteps = prev.steps.filter(
        (_, stepIndex) => stepIndex !== index
      );
      return {
        ...prev,
        steps: ensureStepDrafts(nextSteps),
      };
    });
  }, []);

  const trimmedSteps = useMemo(
    () =>
      formState.steps
        .map((step) => ({
          ...step,
          description: step.description.trim(),
        }))
        .filter((step) => step.description.length > 0),
    [formState.steps]
  );

  const isValid =
    formState.title.trim() !== "" &&
    formState.role.trim() !== "" &&
    formState.goal.trim() !== "" &&
    trimmedSteps.length > 0;

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const successCriteria = sanitizeOptionalField(formState.successCriteria);
      onSubmit({
        ...formState,
        title: formState.title.trim(),
        role: formState.role.trim(),
        goal: formState.goal.trim(),
        successCriteria,
        steps: trimmedSteps,
        painPoints: parsePainPoints(painPointsText),
      });
    },
    [formState, onSubmit, painPointsText, trimmedSteps]
  );

  return (
    <form className={formSectionClass} onSubmit={handleSubmit}>
      <LabeledField id="journey-title" label="Journey Title">
        <input
          id="journey-title"
          className={baseInputClass}
          value={formState.title}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, title: event.target.value }))
          }
          required
        />
      </LabeledField>
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledField id="journey-role" label="Persona / Role">
          <input
            id="journey-role"
            className={baseInputClass}
            value={formState.role}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, role: event.target.value }))
            }
            required
          />
        </LabeledField>
        <LabeledField
          id="journey-success-criteria"
          label="Success Criteria"
          hint="Optional definition of what success looks like for this journey"
        >
          <Textarea
            id="journey-success-criteria"
            value={formState.successCriteria ?? ""}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                successCriteria: event.target.value,
              }))
            }
            placeholder="The persona completes all steps and receives confirmation"
          />
        </LabeledField>
      </div>
      <LabeledField
        id="journey-goal"
        label="Persona Goal"
        hint="Describe what the persona is trying to accomplish"
      >
        <Textarea
          id="journey-goal"
          value={formState.goal}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, goal: event.target.value }))
          }
          required
        />
      </LabeledField>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Journey Steps</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddStep}
          >
            Add Step
          </Button>
        </div>
        {formState.steps.map((step, index) => {
          const stepId = step.id ?? `step-${index}`;
          return (
            <div key={stepId} className="rounded-md border p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <LabeledField
                  id={`journey-step-${index}`}
                  label={`Step ${index + 1}`}
                >
                  <Textarea
                    id={`journey-step-${index}`}
                    value={step.description}
                    onChange={(event) =>
                      handleStepChange(index, event.target.value)
                    }
                    placeholder={`Describe the action for step ${index + 1}`}
                  />
                </LabeledField>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveStep(index)}
                  aria-label={`Remove step ${index + 1}`}
                >
                  ×
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <LabeledField
        id="journey-pain-points"
        label="Pain Points"
        hint="List pain points observed during this journey (one per line)"
      >
        <Textarea
          id="journey-pain-points"
          value={painPointsText}
          onChange={(event) => setPainPointsText(event.target.value)}
          placeholder="Step 2: Approval delays due to manual reviews"
        />
      </LabeledField>
      <FormActionButtons
        mode={mode}
        createLabel="Add Journey"
        editLabel="Save Journey"
        onCancel={onCancel}
        submitDisabled={!isValid}
      />
    </form>
  );
}
