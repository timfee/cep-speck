import React from "react";

import type { EditorMode } from "@/lib/workflow/outline-editor-types";

export interface FormComponentProps<Draft> {
  mode: EditorMode;
  initialValues: Draft;
  onCancel: () => void;
  onSubmit: (values: Draft) => void;
}

interface InlineEditorPanelProps<Draft> extends FormComponentProps<Draft> {
  itemLabel: string;
  FormComponent: React.ComponentType<FormComponentProps<Draft>>;
}

export function InlineEditorPanel<Draft>({
  itemLabel,
  FormComponent,
  ...formProps
}: InlineEditorPanelProps<Draft>) {
  const heading =
    formProps.mode === "create" ? `Add ${itemLabel}` : `Edit ${itemLabel}`;

  return (
    <div
      className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4"
      data-testid="inline-editor"
    >
      <h4 className="mb-3 text-sm font-semibold">{heading}</h4>
      <FormComponent {...formProps} />
    </div>
  );
}
