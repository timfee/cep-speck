import { useCallback, useMemo } from "react";
import type { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type {
  CustomerJourneyDraft,
  CustomerJourneyStepDraft,
  EditorMode,
} from "@/lib/workflow/outline-editor-types";

import {
  optionalTextareaField,
  textField,
  textareaField,
} from "@/lib/workflow/outline-form-fields";

import { LabeledField } from "@/lib/workflow/outline-form-shared";

import {
  type OutlineDraftRenderArgs,
  useOutlineDraftForm,
} from "./use-outline-draft-form";

interface CustomerJourneyFormProps {
  mode: EditorMode;
  initialValues: CustomerJourneyDraft;
  onCancel: () => void;
  onSubmit: (values: CustomerJourneyDraft) => void;
}

const ensureStepDrafts = (steps: CustomerJourneyStepDraft[]) =>
  steps.length > 0
    ? steps
    : [
        {
          id: undefined,
          description: "",
        },
      ];

const trimAndFilterSteps = (steps: CustomerJourneyStepDraft[]) =>
  steps
    .map((step) => ({
      ...step,
      description: step.description.trim(),
    }))
    .filter((step) => step.description.length > 0);

const formatPainPoints = (points: string[] | undefined) =>
  (points ?? []).join("\n");

function JourneyStepsSection({
  formState,
  setFormState,
}: OutlineDraftRenderArgs<CustomerJourneyDraft>) {
  const handleStepChange = useCallback(
    (index: number, value: string) => {
      setFormState((prev) => ({
        ...prev,
        steps: prev.steps.map((step, stepIndex) =>
          stepIndex === index ? { ...step, description: value } : step
        ),
      }));
    },
    [setFormState]
  );

  const handleAddStep = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      steps: [...prev.steps, { id: undefined, description: "" }],
    }));
  }, [setFormState]);

  const handleRemoveStep = useCallback(
    (index: number) => {
      setFormState((prev) => ({
        ...prev,
        steps: ensureStepDrafts(
          prev.steps.filter((_, stepIndex) => stepIndex !== index)
        ),
      }));
    },
    [setFormState]
  );

  return (
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
          <div key={stepId} className="space-y-2 rounded-md border p-3">
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
  );
}

function PainPointsSection({
  formState,
  setFormState,
}: OutlineDraftRenderArgs<CustomerJourneyDraft>) {
  const value = useMemo(
    () => formatPainPoints(formState.painPoints),
    [formState.painPoints]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const entries = event.target.value.split(/\r?\n/);
      setFormState((prev) => ({
        ...prev,
        painPoints: entries,
      }));
    },
    [setFormState]
  );

  return (
    <LabeledField
      id="journey-pain-points"
      label="Pain Points"
      hint="List pain points observed during this journey (one per line)"
    >
      <Textarea
        id="journey-pain-points"
        value={value}
        onChange={handleChange}
        placeholder="Step 2: Approval delays due to manual reviews"
      />
    </LabeledField>
  );
}

export function CustomerJourneyForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: CustomerJourneyFormProps) {
  const initialDraft = useMemo(
    () => ({
      ...initialValues,
      steps: ensureStepDrafts(initialValues.steps),
      painPoints: initialValues.painPoints ?? [],
    }),
    [initialValues]
  );

  const sections = useMemo(
    () => [
      {
        kind: "field" as const,
        field: textField<CustomerJourneyDraft>({
          id: "journey-title",
          label: "Journey Title",
          path: "title",
          required: true,
        }),
      },
      {
        kind: "group" as const,
        id: "journey-basics",
        className: "grid gap-4 md:grid-cols-2",
        fields: [
          textField<CustomerJourneyDraft>({
            id: "journey-role",
            label: "Persona / Role",
            path: "role",
            required: true,
          }),
          optionalTextareaField<CustomerJourneyDraft>({
            id: "journey-success-criteria",
            label: "Success Criteria",
            path: "successCriteria",
            hint: "Optional definition of what success looks like for this journey",
          }),
        ],
      },
      {
        kind: "field" as const,
        field: textareaField<CustomerJourneyDraft>({
          id: "journey-goal",
          label: "Persona Goal",
          path: "goal",
          required: true,
          hint: "Describe what the persona is trying to accomplish",
        }),
      },
      {
        kind: "custom" as const,
        id: "journey-steps",
        render: (args: OutlineDraftRenderArgs<CustomerJourneyDraft>) => (
          <JourneyStepsSection {...args} />
        ),
        prepare: (draft: CustomerJourneyDraft) => ({
          ...draft,
          steps: trimAndFilterSteps(draft.steps),
        }),
      },
      {
        kind: "custom" as const,
        id: "journey-pain-points",
        render: (args: OutlineDraftRenderArgs<CustomerJourneyDraft>) => (
          <PainPointsSection {...args} />
        ),
        prepare: (draft: CustomerJourneyDraft) => ({
          ...draft,
          painPoints: (draft.painPoints ?? [])
            .map((point) => point.trim())
            .filter((point) => point.length > 0),
        }),
      },
    ],
    []
  );

  const validate = useCallback(
    (draft: CustomerJourneyDraft) =>
      draft.title.length > 0 &&
      draft.role.length > 0 &&
      draft.goal.length > 0 &&
      draft.steps.length > 0,
    []
  );

  const { Form } = useOutlineDraftForm({
    mode,
    initialValues: initialDraft,
    onCancel,
    onSubmit,
    submitLabels: {
      create: "Add Journey",
      edit: "Save Journey",
    },
    sections,
    validate,
  });

  return Form;
}
