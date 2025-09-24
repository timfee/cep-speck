import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import type { EditorMode } from "./outline-editor-types";

export const baseInputClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary";

export const formSectionClass = "space-y-4";

interface LabeledFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  hint?: ReactNode;
}

export function LabeledField({ id, label, children, hint }: LabeledFieldProps) {
  const hasHint = hint !== undefined && hint !== null;
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {children}
      {hasHint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

interface FormActionButtonsProps {
  mode: EditorMode;
  createLabel: string;
  editLabel: string;
  onCancel: () => void;
  submitDisabled?: boolean;
}

export function FormActionButtons({
  mode,
  createLabel,
  editLabel,
  onCancel,
  submitDisabled = false,
}: FormActionButtonsProps) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={submitDisabled}>
        {mode === "create" ? createLabel : editLabel}
      </Button>
    </div>
  );
}
