import type { FunctionalRequirement } from "@/types/workflow";

import {
  normalizeOptionalString,
  requireMeaningfulField,
} from "./outline-text-utils";

export interface FunctionalRequirementInput
  extends Pick<FunctionalRequirement, "title" | "description">,
    Partial<Omit<FunctionalRequirement, "id" | "title" | "description">> {
  priority?: FunctionalRequirement["priority"];
}

export function createNewFunctionalRequirement(
  input: FunctionalRequirementInput
): FunctionalRequirement {
  const title = requireMeaningfulField(input.title, {
    empty: "Functional requirements must include both a title and description.",
    placeholder:
      "Provide a specific title for the functional requirement before saving.",
  });
  const description = requireMeaningfulField(input.description, {
    empty: "Functional requirements must include both a title and description.",
    placeholder:
      "Describe the functional requirement instead of leaving placeholder text.",
  });

  return {
    id: `fr-${Date.now()}`,
    title,
    description,
    priority: input.priority ?? "P1",
    userStory: normalizeOptionalString(input.userStory),
    acceptanceCriteria: input.acceptanceCriteria,
    dependencies: input.dependencies,
    estimatedEffort: normalizeOptionalString(input.estimatedEffort),
  };
}
