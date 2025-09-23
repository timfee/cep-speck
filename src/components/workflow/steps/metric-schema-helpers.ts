import type { SuccessMetricField, SuccessMetricSchema } from "@/types/workflow";

import { createOutlineId } from "./outline-id";

import {
  normalizeOptionalString,
  requireMeaningfulField,
} from "./outline-text-utils";

export interface SuccessMetricFieldInput
  extends Pick<SuccessMetricField, "name" | "description">,
    Partial<Omit<SuccessMetricField, "id" | "name" | "description">> {
  id?: string;
}

export interface SuccessMetricSchemaInput
  extends Pick<SuccessMetricSchema, "title" | "description">,
    Partial<
      Omit<SuccessMetricSchema, "id" | "title" | "description" | "fields">
    > {
  fields?: SuccessMetricFieldInput[];
}

const sanitizeAllowedValues = (
  values?: string[]
): SuccessMetricField["allowedValues"] => {
  if (!values) {
    return undefined;
  }

  const cleaned = values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return cleaned.length > 0 ? cleaned : undefined;
};

const sanitizeFields = (
  fields: SuccessMetricSchemaInput["fields"]
): SuccessMetricField[] => {
  if (!fields) {
    return [];
  }

  return fields.map<SuccessMetricField>((field) => {
    const name = requireMeaningfulField(field.name, {
      empty: "Metric fields must include a name.",
      placeholder: "Provide a descriptive field name.",
    });
    const description = requireMeaningfulField(field.description, {
      empty: "Metric fields must include a description.",
      placeholder: "Explain what the field captures.",
    });

    const allowedValues = sanitizeAllowedValues(field.allowedValues);
    const normalizedSourceSystem = normalizeOptionalString(field.sourceSystem);
    const sourceSystem: SuccessMetricField["sourceSystem"] =
      typeof normalizedSourceSystem === "string" &&
      normalizedSourceSystem.length > 0
        ? normalizedSourceSystem
        : undefined;

    return {
      id: field.id ?? createOutlineId("metric-field"),
      name,
      description,
      dataType: field.dataType ?? "string",
      required: field.required ?? false,
      allowedValues,
      sourceSystem,
    };
  });
};

export function createNewSuccessMetricSchema(
  input: SuccessMetricSchemaInput
): SuccessMetricSchema {
  const title = requireMeaningfulField(input.title, {
    empty: "Metric schemas require a title to organize fields.",
    placeholder: "Name the schema so drafters understand its purpose.",
  });
  const description = requireMeaningfulField(input.description, {
    empty: "Metric schemas must describe what they measure.",
    placeholder: "Describe how this schema supports the PRD.",
  });

  return {
    id: createOutlineId("metric-schema"),
    title,
    description,
    fields: sanitizeFields(input.fields),
  };
}
