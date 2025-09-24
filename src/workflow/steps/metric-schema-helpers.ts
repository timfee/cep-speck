import type {
  SuccessMetricFieldDraft,
  SuccessMetricSchemaDraft,
} from "@/lib/workflow/outline-editor-types";

import type { SuccessMetricField, SuccessMetricSchema } from "@/types/workflow";

import type { OutlineEntityDescriptor } from "./outline-entity-descriptor";
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

export const successMetricSchemaDescriptor: OutlineEntityDescriptor<
  SuccessMetricSchema,
  SuccessMetricSchemaDraft
> = {
  idKey: "id",
  defaults: () => ({
    title: "",
    description: "",
    fields: [],
  }),
  toDraft: (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    fields: item.fields.map<SuccessMetricFieldDraft>((field) => ({
      id: field.id,
      name: field.name,
      description: field.description,
      dataType: field.dataType,
      required: field.required,
      allowedValues: field.allowedValues,
      sourceSystem: field.sourceSystem,
    })),
  }),
  fromDraft: (draft, fallbackId) => {
    const created = createNewSuccessMetricSchema({
      title: draft.title,
      description: draft.description,
      fields: draft.fields,
    });

    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
};
