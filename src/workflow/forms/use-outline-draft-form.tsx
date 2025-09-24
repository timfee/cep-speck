import { useCallback, useMemo, type ReactNode } from "react";

import { Textarea } from "@/components/ui/textarea";

import {
  type DraftFormFieldConfig,
  useDraftFormController,
} from "@/hooks/use-draft-form-controller";

import type { EditorMode } from "@/lib/workflow/outline-editor-types";

import {
  FormActionButtons,
  LabeledField,
  baseInputClass,
  formSectionClass,
} from "@/lib/workflow/outline-form-shared";

type FieldPath<TDraft> = Extract<keyof TDraft, string>;

type BaseFieldConfig<TDraft> = {
  id: string;
  label: string;
  path: FieldPath<TDraft>;
  hint?: ReactNode;
  placeholder?: string;
  required?: boolean;
  trim?: boolean;
  optional?: boolean;
};

export type OutlineDraftTextField<TDraft> = BaseFieldConfig<TDraft> & {
  kind: "text";
  inputType?: string;
};

export type OutlineDraftTextareaField<TDraft> = BaseFieldConfig<TDraft> & {
  kind: "textarea";
};

export type OutlineDraftSelectOption = {
  value: string;
  label: string;
};

export type OutlineDraftSelectField<TDraft> = BaseFieldConfig<TDraft> & {
  kind: "select";
  options: OutlineDraftSelectOption[];
};

export type OutlineDraftCustomField<TDraft> = {
  kind: "custom";
  id: string;
  render: (args: OutlineDraftRenderArgs<TDraft>) => ReactNode;
};

export type OutlineDraftFieldConfig<TDraft> =
  | OutlineDraftTextField<TDraft>
  | OutlineDraftTextareaField<TDraft>
  | OutlineDraftSelectField<TDraft>
  | OutlineDraftCustomField<TDraft>;

export type OutlineDraftFormSection<TDraft> =
  | { kind: "field"; field: OutlineDraftFieldConfig<TDraft> }
  | {
      kind: "group";
      id: string;
      className?: string;
      fields: OutlineDraftFieldConfig<TDraft>[];
    }
  | OutlineDraftCustomSection<TDraft>;

export type OutlineDraftCustomSection<TDraft> = {
  kind: "custom";
  id: string;
  render: (args: OutlineDraftRenderArgs<TDraft>) => ReactNode;
  prepare?: (draft: TDraft) => TDraft;
};

export interface OutlineDraftRenderArgs<TDraft> {
  formState: TDraft;
  setFormState: React.Dispatch<React.SetStateAction<TDraft>>;
  updateField: <K extends FieldPath<TDraft>>(path: K, value: TDraft[K]) => void;
}

export interface OutlineDraftFormOptions<TDraft> {
  mode: EditorMode;
  initialValues: TDraft;
  onCancel: () => void;
  onSubmit: (values: TDraft) => void;
  submitLabels: { create: string; edit: string };
  sections: OutlineDraftFormSection<TDraft>[];
  validate?: (draft: TDraft) => boolean;
  prepare?: (draft: TDraft) => TDraft;
}

interface OutlineDraftFormResult<TDraft> {
  Form: ReactNode;
  formState: TDraft;
  setFormState: React.Dispatch<React.SetStateAction<TDraft>>;
  updateField: <K extends FieldPath<TDraft>>(path: K, value: TDraft[K]) => void;
  preparedDraft: TDraft;
}

function flattenFieldConfigs<TDraft>(
  sections: OutlineDraftFormSection<TDraft>[]
): OutlineDraftFieldConfig<TDraft>[] {
  const fields: OutlineDraftFieldConfig<TDraft>[] = [];
  for (const section of sections) {
    if (section.kind === "field") {
      fields.push(section.field);
    } else if (section.kind === "group") {
      fields.push(...section.fields);
    }
  }

  return fields;
}

function toDraftFieldConfigs<TDraft>(
  fields: OutlineDraftFieldConfig<TDraft>[]
): DraftFormFieldConfig<TDraft>[] {
  return fields
    .filter(
      (
        field
      ): field is Exclude<
        OutlineDraftFieldConfig<TDraft>,
        OutlineDraftCustomField<TDraft>
      > => field.kind !== "custom"
    )
    .map((field) => ({
      path: field.path,
      optional: field.optional === true,
      trim: field.trim ?? field.kind !== "select",
    }));
}

export function useOutlineDraftForm<TDraft>(
  options: OutlineDraftFormOptions<TDraft>
): OutlineDraftFormResult<TDraft> {
  const {
    mode,
    initialValues,
    onCancel,
    onSubmit,
    submitLabels,
    sections,
    prepare: prepareDraft,
    validate: validateDraft,
  } = options;

  const flattenedFields = useMemo(
    () => flattenFieldConfigs(sections),
    [sections]
  );

  const draftFieldConfigs = useMemo(
    () => toDraftFieldConfigs(flattenedFields),
    [flattenedFields]
  );

  const sectionPreparers = useMemo(
    () =>
      sections
        .filter(
          (
            section
          ): section is OutlineDraftCustomSection<TDraft> & {
            prepare: (draft: TDraft) => TDraft;
          } =>
            section.kind === "custom" && typeof section.prepare === "function"
        )
        .map((section) => section.prepare),
    [sections]
  );

  const combinedPrepare = useCallback(
    (draft: TDraft) => {
      let nextDraft = draft;

      for (const prepareSection of sectionPreparers) {
        nextDraft = prepareSection(nextDraft);
      }

      if (prepareDraft) {
        nextDraft = prepareDraft(nextDraft);
      }

      return nextDraft;
    },
    [prepareDraft, sectionPreparers]
  );

  const {
    formState,
    setFormState,
    updateField,
    preparedDraft,
    isValid,
    handleSubmit,
  } = useDraftFormController({
    initialValues,
    fields: draftFieldConfigs,
    onSubmit,
    prepare: combinedPrepare,
    validate: validateDraft,
  });

  const renderField = useCallback(
    (field: OutlineDraftFieldConfig<TDraft>) => {
      if (field.kind === "custom") {
        return field.render({ formState, setFormState, updateField });
      }

      const commonProps = {
        id: field.id,
        required: field.required,
      } as const;

      switch (field.kind) {
        case "text": {
          const value = (formState[field.path] ?? "") as string;
          return (
            <LabeledField
              key={field.id}
              id={field.id}
              label={field.label}
              hint={field.hint}
            >
              <input
                {...commonProps}
                type={field.inputType ?? "text"}
                className={baseInputClass}
                placeholder={field.placeholder}
                value={value}
                onChange={(event) =>
                  updateField(
                    field.path,
                    event.target.value as TDraft[typeof field.path]
                  )
                }
              />
            </LabeledField>
          );
        }
        case "textarea": {
          const value = (formState[field.path] ?? "") as string;
          return (
            <LabeledField
              key={field.id}
              id={field.id}
              label={field.label}
              hint={field.hint}
            >
              <Textarea
                {...commonProps}
                placeholder={field.placeholder}
                value={value}
                onChange={(event) =>
                  updateField(
                    field.path,
                    event.target.value as TDraft[typeof field.path]
                  )
                }
              />
            </LabeledField>
          );
        }
        case "select": {
          const value = (formState[field.path] ?? "") as string;
          return (
            <LabeledField
              key={field.id}
              id={field.id}
              label={field.label}
              hint={field.hint}
            >
              <select
                {...commonProps}
                className={baseInputClass}
                value={value}
                onChange={(event) =>
                  updateField(
                    field.path,
                    event.target.value as TDraft[typeof field.path]
                  )
                }
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </LabeledField>
          );
        }
        default:
          return null;
      }
    },
    [formState, setFormState, updateField]
  );

  const renderSection = useCallback(
    (section: OutlineDraftFormSection<TDraft>) => {
      if (section.kind === "field") {
        return <div key={section.field.id}>{renderField(section.field)}</div>;
      }

      if (section.kind === "group") {
        return (
          <div key={section.id} className={section.className}>
            {section.fields.map((field) => (
              <div key={field.id}>{renderField(field)}</div>
            ))}
          </div>
        );
      }

      return (
        <div key={section.id}>
          {section.render({ formState, setFormState, updateField })}
        </div>
      );
    },
    [formState, renderField, setFormState, updateField]
  );

  const Form = (
    <form className={formSectionClass} onSubmit={handleSubmit}>
      {sections.map((section) => renderSection(section))}
      <FormActionButtons
        mode={mode}
        createLabel={submitLabels.create}
        editLabel={submitLabels.edit}
        onCancel={onCancel}
        submitDisabled={!isValid}
      />
    </form>
  );

  return {
    Form,
    formState,
    setFormState,
    updateField,
    preparedDraft,
  } as const;
}
