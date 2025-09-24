import type { ReactNode } from "react";

import type {
  OutlineDraftFieldConfig,
  OutlineDraftSelectField,
  OutlineDraftSelectOption,
  OutlineDraftTextareaField,
  OutlineDraftTextField,
} from "./use-outline-draft-form";

type FieldOptions<TDraft> = {
  id: string;
  label: string;
  path: Extract<keyof TDraft, string>;
  hint?: ReactNode;
  placeholder?: string;
  required?: boolean;
  inputType?: string;
};

export function textField<TDraft>(
  options: FieldOptions<TDraft>
): OutlineDraftTextField<TDraft> {
  return {
    kind: "text",
    trim: true,
    ...options,
  };
}

export function textareaField<TDraft>(
  options: FieldOptions<TDraft>
): OutlineDraftTextareaField<TDraft> {
  return {
    kind: "textarea",
    trim: true,
    ...options,
  };
}

export function optionalTextField<TDraft>(
  options: FieldOptions<TDraft>
): OutlineDraftTextField<TDraft> {
  return {
    ...textField(options),
    optional: true,
  };
}

export function optionalTextareaField<TDraft>(
  options: FieldOptions<TDraft>
): OutlineDraftTextareaField<TDraft> {
  return {
    ...textareaField(options),
    optional: true,
  };
}

interface SelectFieldOptions<TDraft> extends FieldOptions<TDraft> {
  options: OutlineDraftSelectOption[];
}

export function selectField<TDraft>(
  options: SelectFieldOptions<TDraft>
): OutlineDraftSelectField<TDraft> {
  return {
    kind: "select",
    trim: false,
    ...options,
  };
}

export const PRIORITY_OPTIONS: OutlineDraftSelectOption[] = [
  { value: "P0", label: "P0 - Critical" },
  { value: "P1", label: "P1 - High" },
  { value: "P2", label: "P2 - Nice to have" },
];

export const METRIC_TYPE_OPTIONS: OutlineDraftSelectOption[] = [
  { value: "engagement", label: "Engagement" },
  { value: "adoption", label: "Adoption" },
  { value: "performance", label: "Performance" },
  { value: "business", label: "Business" },
];

export const MILESTONE_PHASE_OPTIONS: OutlineDraftSelectOption[] = [
  { value: "research", label: "Research" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "testing", label: "Testing" },
  { value: "launch", label: "Launch" },
  { value: "post-launch", label: "Post-launch" },
];

export type OutlineDraftFieldBuilder<TDraft> = (
  options: FieldOptions<TDraft>
) => OutlineDraftFieldConfig<TDraft>;
