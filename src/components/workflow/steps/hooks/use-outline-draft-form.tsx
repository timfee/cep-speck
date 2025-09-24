import { useCallback, useMemo, useState, type ReactNode } from "react";

import { Textarea } from "@/components/ui/textarea";

import type { EditorMode } from "./outline-editor-types";

import {
  FormActionButtons,
  LabeledField,
  baseInputClass,
  formSectionClass,
  sanitizeOptionalField,
} from "./outline-form-shared";

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

const cloneDraft = <TDraft,>(value: TDraft): TDraft => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as TDraft;
};

function applyFieldSanitizers<TDraft>(
  draft: TDraft,
  fields: OutlineDraftFieldConfig<TDraft>[]
): TDraft {
  const next = cloneDraft(draft);

  for (const field of fields) {
    if (field.kind === "custom") {
      continue;
    }

    const currentValue = next[field.path];
    if (typeof currentValue !== "string") {
      continue;
    }

    const shouldTrim = field.trim ?? field.kind !== "select";
    if (shouldTrim) {
      const trimmed = currentValue.trim();
      if (field.optional === true) {
        next[field.path] = sanitizeOptionalField(
          trimmed
        ) as TDraft[typeof field.path];
      } else {
        next[field.path] = trimmed as TDraft[typeof field.path];
      }
      continue;
    }

    if (field.optional === true) {
      next[field.path] = sanitizeOptionalField(
        currentValue
      ) as TDraft[typeof field.path];
    }
  }

  return next;
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

  const [formState, setFormState] = useState<TDraft>(() =>
    cloneDraft(initialValues)
  );

  const flattenedFields = useMemo(
    () => flattenFieldConfigs(sections),
    [sections]
  );

  const updateField = useCallback(
    <K extends FieldPath<TDraft>>(path: K, value: TDraft[K]) => {
      setFormState((prev) => ({ ...prev, [path]: value }));
    },
    []
  );

  const preparedDraft = useMemo(() => {
    let draft = applyFieldSanitizers(formState, flattenedFields);

    for (const section of sections) {
      if (section.kind === "custom" && section.prepare) {
        draft = section.prepare(draft);
      }
    }

    if (prepareDraft) {
      draft = prepareDraft(draft);
    }

    return draft;
  }, [formState, flattenedFields, sections, prepareDraft]);

  const isValid =
    typeof validateDraft === "function" ? validateDraft(preparedDraft) : true;

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit(preparedDraft);
    },
    [onSubmit, preparedDraft]
  );

  const renderField = useCallback(
    (field: OutlineDraftFieldConfig<TDraft>) => {
      if (field.kind === "custom") {
        return field.render({ formState, setFormState, updateField });
      }

      const commonProps = {
        id: field.id,
        required: field.required,
      } as const;

      if (field.kind === "text") {
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

      if (field.kind === "textarea") {
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
    },
    [formState, updateField]
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
