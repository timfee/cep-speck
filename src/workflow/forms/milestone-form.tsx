import { useCallback, useMemo } from "react";

import type {
  EditorMode,
  MilestoneDraft,
} from "@/lib/workflow/outline-editor-types";

import {
  MILESTONE_PHASE_OPTIONS,
  optionalTextField,
  selectField,
  textField,
  textareaField,
} from "@/lib/workflow/outline-form-fields";

import { useOutlineDraftForm } from "./use-outline-draft-form";

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
  const sections = useMemo(
    () => [
      {
        kind: "field" as const,
        field: textField<MilestoneDraft>({
          id: "milestone-title",
          label: "Title",
          path: "title",
          required: true,
        }),
      },
      {
        kind: "field" as const,
        field: textareaField<MilestoneDraft>({
          id: "milestone-description",
          label: "Description",
          path: "description",
          required: true,
        }),
      },
      {
        kind: "group" as const,
        id: "milestone-details",
        className: "grid gap-4 md:grid-cols-2",
        fields: [
          selectField<MilestoneDraft>({
            id: "milestone-phase",
            label: "Phase",
            path: "phase",
            options: MILESTONE_PHASE_OPTIONS,
          }),
          optionalTextField<MilestoneDraft>({
            id: "milestone-date",
            label: "Estimated Date",
            path: "estimatedDate",
            hint: "Optional target date for delivery.",
            inputType: "date",
          }),
        ],
      },
    ],
    []
  );

  const validate = useCallback(
    (draft: MilestoneDraft) =>
      draft.title.length > 0 && draft.description.length > 0,
    []
  );

  const { Form } = useOutlineDraftForm({
    mode,
    initialValues,
    onCancel,
    onSubmit,
    submitLabels: {
      create: "Add Milestone",
      edit: "Save Milestone",
    },
    sections,
    validate,
  });

  return Form;
}
