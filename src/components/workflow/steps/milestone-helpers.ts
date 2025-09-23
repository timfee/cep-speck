import type { Milestone } from "@/types/workflow";

import { createMilestone } from "./entity-factory";

export interface MilestoneInput
  extends Pick<Milestone, "title" | "description">,
    Partial<Omit<Milestone, "id" | "title" | "description">> {
  phase?: Milestone["phase"];
}

export function createNewMilestone(input: MilestoneInput): Milestone {
  return createMilestone(input);
}
