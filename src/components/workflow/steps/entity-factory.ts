/**
 * Generic entity factory for creating workflow entities
 * Consolidates common patterns from multiple helper files
 */

import { createOutlineId } from "./outline-id";

import {
  normalizeOptionalString,
  requireMeaningfulField,
} from "./outline-text-utils";

/**
 * Base configuration for entity creation
 */
interface EntityFactoryConfig<T> {
  idPrefix: string;
  requiredFields: Array<{
    field: keyof T;
    emptyMessage: string;
    placeholderMessage: string;
  }>;
  defaultValues?: Partial<T>;
  transform?: (input: Record<string, unknown>) => Partial<T>;
}

/**
 * Generic entity factory that consolidates common creation patterns
 */
export function createEntityFactory<
  TInput extends Record<string, unknown>,
  TOutput extends { id: string },
>(config: EntityFactoryConfig<TOutput>) {
  return function createEntity(input: TInput): TOutput {
    const result: Record<string, unknown> = {
      id: createOutlineId(config.idPrefix),
      ...config.defaultValues,
    };

    // Process required fields
    for (const fieldConfig of config.requiredFields) {
      const value = input[fieldConfig.field as string];
      result[fieldConfig.field as string] = requireMeaningfulField(
        value as string,
        {
          empty: fieldConfig.emptyMessage,
          placeholder: fieldConfig.placeholderMessage,
        }
      );
    }

    // Apply transformations if provided
    if (config.transform) {
      Object.assign(result, config.transform(input));
    }

    // Copy other fields with optional string normalization
    for (const [key, value] of Object.entries(input)) {
      if (
        !Object.prototype.hasOwnProperty.call(result, key) &&
        value !== undefined
      ) {
        result[key] =
          typeof value === "string" ? normalizeOptionalString(value) : value;
      }
    }

    return result as TOutput;
  };
}

/**
 * Common entity creation patterns
 */
export const createMilestone = createEntityFactory({
  idPrefix: "ms",
  requiredFields: [
    {
      field: "title",
      emptyMessage: "Milestones require a title and description.",
      placeholderMessage:
        "Provide a milestone title instead of placeholder text.",
    },
    {
      field: "description",
      emptyMessage: "Milestones require a title and description.",
      placeholderMessage:
        "Add details for the milestone rather than leaving placeholder text.",
    },
  ],
  defaultValues: { phase: "development" },
});

export const createFunctionalRequirement = createEntityFactory({
  idPrefix: "fr",
  requiredFields: [
    {
      field: "title",
      emptyMessage:
        "Functional requirements must include both a title and description.",
      placeholderMessage:
        "Provide a specific title for the functional requirement before saving.",
    },
    {
      field: "description",
      emptyMessage:
        "Functional requirements must include both a title and description.",
      placeholderMessage:
        "Describe the functional requirement instead of leaving placeholder text.",
    },
  ],
  defaultValues: { priority: "P0" },
});

export const createSuccessMetric = createEntityFactory({
  idPrefix: "sm",
  requiredFields: [
    {
      field: "name",
      emptyMessage: "Success metrics require a name and description.",
      placeholderMessage:
        "Replace the placeholder with a meaningful success metric name.",
    },
    {
      field: "description",
      emptyMessage: "Success metrics require a name and description.",
      placeholderMessage:
        "Describe how the success metric will be evaluated instead of using placeholder text.",
    },
  ],
  defaultValues: { type: "engagement" },
});
