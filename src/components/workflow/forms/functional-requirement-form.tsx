import { useCallback, useMemo } from "react";

import type {
  EditorMode,
  FunctionalRequirementDraft,
} from "@/lib/workflow/outline-editor-types";

import {
  PRIORITY_OPTIONS,
  optionalTextField,
  optionalTextareaField,
  selectField,
  textField,
  textareaField,
} from "@/lib/workflow/outline-form-fields";

import { useOutlineDraftForm } from "./use-outline-draft-form";

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
  const sections = useMemo(
    () => [
      {
        kind: "field" as const,
        field: textField<FunctionalRequirementDraft>({
          id: "functional-title",
          label: "Title",
          path: "title",
          required: true,
        }),
      },
      {
        kind: "field" as const,
        field: textareaField<FunctionalRequirementDraft>({
          id: "functional-description",
          label: "Description",
          path: "description",
          required: true,
        }),
      },
      {
        kind: "group" as const,
        id: "functional-details",
        className: "grid gap-4 md:grid-cols-2",
        fields: [
          selectField<FunctionalRequirementDraft>({
            id: "functional-priority",
            label: "Priority",
            path: "priority",
            options: PRIORITY_OPTIONS,
          }),
          optionalTextField<FunctionalRequirementDraft>({
            id: "functional-effort",
            label: "Estimated Effort",
            path: "estimatedEffort",
            placeholder: "e.g., 3 sprints",
          }),
        ],
      },
      {
        kind: "field" as const,
        field: optionalTextareaField<FunctionalRequirementDraft>({
          id: "functional-story",
          label: "User Story",
          path: "userStory",
          hint: "Optional narrative that frames the requirement from the user's point of view.",
          placeholder: "As a user, I want...",
        }),
      },
    ],
    []
  );

  const validate = useCallback(
    (draft: FunctionalRequirementDraft) =>
      draft.title.length > 0 && draft.description.length > 0,
    []
  );

  const { Form } = useOutlineDraftForm({
    mode,
    initialValues,
    onCancel,
    onSubmit,
    submitLabels: {
      create: "Add Requirement",
      edit: "Save Requirement",
    },
    sections,
    validate,
  });

  return Form;
}
