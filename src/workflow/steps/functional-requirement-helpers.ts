import type { FunctionalRequirementDraft } from "@/lib/workflow/outline-editor-types";
import type { FunctionalRequirement } from "@/types/workflow";

import { createFunctionalRequirement } from "./entity-factory";
import type { OutlineEntityDescriptor } from "./outline-entity-descriptor";

export interface FunctionalRequirementInput
  extends Pick<FunctionalRequirement, "title" | "description">,
    Partial<Omit<FunctionalRequirement, "id" | "title" | "description">> {
  priority?: FunctionalRequirement["priority"];
}

export function createNewFunctionalRequirement(
  input: FunctionalRequirementInput
): FunctionalRequirement {
  return createFunctionalRequirement(input);
}

export const functionalRequirementDescriptor: OutlineEntityDescriptor<
  FunctionalRequirement,
  FunctionalRequirementDraft
> = {
  idKey: "id",
  defaults: () => ({
    title: "",
    description: "",
    priority: "P1",
  }),
  toDraft: (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    priority: item.priority,
    userStory: item.userStory,
    acceptanceCriteria: item.acceptanceCriteria,
    dependencies: item.dependencies,
    estimatedEffort: item.estimatedEffort,
  }),
  fromDraft: (draft, fallbackId) => {
    const created = createFunctionalRequirement({
      title: draft.title,
      description: draft.description,
      priority: draft.priority,
      userStory: draft.userStory,
      acceptanceCriteria: draft.acceptanceCriteria,
      dependencies: draft.dependencies,
      estimatedEffort: draft.estimatedEffort,
    });

    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
};
