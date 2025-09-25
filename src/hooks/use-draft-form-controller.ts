import { useCallback, useMemo, useState, type FormEvent } from "react";

import { sanitizeOptionalField } from "@/lib/utils";

type FieldPath<TDraft> = Extract<keyof TDraft, string>;

export interface DraftFormFieldConfig<TDraft> {
  path: FieldPath<TDraft>;
  optional?: boolean;
  trim?: boolean;
}

export interface DraftFormControllerOptions<TDraft> {
  initialValues: TDraft;
  fields?: DraftFormFieldConfig<TDraft>[];
  onSubmit: (values: TDraft) => void;
  prepare?: (draft: TDraft) => TDraft;
  validate?: (draft: TDraft) => boolean;
}

export interface DraftFormControllerResult<TDraft> {
  formState: TDraft;
  setFormState: React.Dispatch<React.SetStateAction<TDraft>>;
  updateField: <K extends FieldPath<TDraft>>(path: K, value: TDraft[K]) => void;
  preparedDraft: TDraft;
  isValid: boolean;
  handleSubmit: (event?: FormEvent<HTMLFormElement>) => void;
}

const cloneDraft = <TDraft>(value: TDraft): TDraft => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as TDraft;
};

const applyFieldSanitizers = <TDraft>(
  draft: TDraft,
  fields: DraftFormFieldConfig<TDraft>[]
): TDraft => {
  if (fields.length === 0) {
    return draft;
  }

  const next = cloneDraft(draft);

  for (const field of fields) {
    const currentValue = next[field.path];

    if (typeof currentValue !== "string") {
      continue;
    }

    const shouldTrim = field.trim ?? true;
    const sanitized = shouldTrim ? currentValue.trim() : currentValue;

    if (field.optional === true) {
      const optionalResult = sanitizeOptionalField(sanitized);
      next[field.path] = optionalResult as TDraft[typeof field.path];
      continue;
    }

    next[field.path] = sanitized as TDraft[typeof field.path];
  }

  return next;
};

export function useDraftFormController<TDraft>(
  options: DraftFormControllerOptions<TDraft>
): DraftFormControllerResult<TDraft> {
  const { initialValues, fields = [], onSubmit, prepare, validate } = options;

  const [formState, setFormState] = useState<TDraft>(() =>
    cloneDraft(initialValues)
  );

  const updateField = useCallback(
    <K extends FieldPath<TDraft>>(path: K, value: TDraft[K]) => {
      setFormState((prev) => ({ ...prev, [path]: value }));
    },
    [setFormState]
  );

  const preparedDraft = useMemo(() => {
    let draft = applyFieldSanitizers(formState, fields);

    if (typeof prepare === "function") {
      draft = prepare(draft);
    }

    return draft;
  }, [fields, formState, prepare]);

  const isValid = useMemo(
    () => (typeof validate === "function" ? validate(preparedDraft) : true),
    [preparedDraft, validate]
  );

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      onSubmit(preparedDraft);
    },
    [onSubmit, preparedDraft]
  );

  return {
    formState,
    setFormState,
    updateField,
    preparedDraft,
    isValid,
    handleSubmit,
  } as const;
}
