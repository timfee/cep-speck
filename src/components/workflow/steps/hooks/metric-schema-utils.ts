import { sanitizeOptionalField } from "@/hooks/sanitize-utils";

import type { SuccessMetricFieldDraft } from "./outline-editor-types";

export const createDefaultMetricField = (): SuccessMetricFieldDraft => ({
  id: undefined,
  name: "",
  description: "",
  dataType: "string" as SuccessMetricFieldDraft["dataType"],
  required: false,
  allowedValues: [],
});

export const ensureFieldDrafts = (fields: SuccessMetricFieldDraft[]) =>
  fields.length > 0 ? fields : [createDefaultMetricField()];

export const normalizeMetricField = (
  field: SuccessMetricFieldDraft
): SuccessMetricFieldDraft => ({
  ...field,
  name: field.name.trim(),
  description: field.description.trim(),
  allowedValues: (field.allowedValues ?? [])
    .map((value) => value.trim())
    .filter((value) => value.length > 0),
  sourceSystem: sanitizeOptionalField(field.sourceSystem),
});
