import type { FunctionalRequirement } from "@/types/workflow";

import { createFunctionalRequirement } from "./entity-factory";

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
