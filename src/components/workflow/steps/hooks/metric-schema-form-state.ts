import { useCallback, useMemo, useState } from "react";

import type { MetricFieldUpdateHandler } from "./metric-field-editor";

import {
  createDefaultMetricField,
  ensureFieldDrafts,
  normalizeMetricField,
} from "./metric-schema-utils";

import type {
  SuccessMetricFieldDraft,
  SuccessMetricSchemaDraft,
} from "./outline-editor-types";

export function useMetricSchemaState(initialValues: SuccessMetricSchemaDraft) {
  const [formState, setFormState] = useState<SuccessMetricSchemaDraft>(() => ({
    ...initialValues,
    fields: ensureFieldDrafts(initialValues.fields),
  }));

  const updateField = useCallback<MetricFieldUpdateHandler>(
    (index, key, value) => {
      setFormState((prev) => ({
        ...prev,
        fields: prev.fields.map((field, fieldIndex) => {
          if (fieldIndex !== index) {
            return field;
          }

          if (key === "dataType") {
            return {
              ...field,
              dataType: value as SuccessMetricFieldDraft["dataType"],
              allowedValues: [],
            };
          }

          return {
            ...field,
            [key]: value,
          };
        }),
      }));
    },
    []
  );

  const handleAddField = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      fields: [...prev.fields, createDefaultMetricField()],
    }));
  }, []);

  const handleRemoveField = useCallback((index: number) => {
    setFormState((prev) => {
      const nextFields = prev.fields.filter(
        (_, fieldIndex) => fieldIndex !== index
      );
      return {
        ...prev,
        fields: ensureFieldDrafts(nextFields),
      };
    });
  }, []);

  const trimmedFields = useMemo(
    () =>
      formState.fields
        .map((field) => normalizeMetricField(field))
        .filter(
          (field) => field.name.length > 0 && field.description.length > 0
        ),
    [formState.fields]
  );

  const isValid = useMemo(
    () =>
      formState.title.trim() !== "" &&
      formState.description.trim() !== "" &&
      trimmedFields.length > 0,
    [formState.description, formState.title, trimmedFields]
  );

  return {
    formState,
    setFormState,
    updateField,
    handleAddField,
    handleRemoveField,
    trimmedFields,
    isValid,
  } as const;
}
