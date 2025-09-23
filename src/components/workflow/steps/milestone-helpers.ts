import type { Milestone } from "@/types/workflow";

import {
  normalizeOptionalString,
  requireMeaningfulField,
} from "./outline-text-utils";

export interface MilestoneInput
  extends Pick<Milestone, "title" | "description">,
    Partial<Omit<Milestone, "id" | "title" | "description">> {
  phase?: Milestone["phase"];
}

export function createNewMilestone(input: MilestoneInput): Milestone {
  const title = requireMeaningfulField(input.title, {
    empty: "Milestones require a title and description.",
    placeholder: "Provide a milestone title instead of placeholder text.",
  });
  const description = requireMeaningfulField(input.description, {
    empty: "Milestones require a title and description.",
    placeholder:
      "Add details for the milestone rather than leaving placeholder text.",
  });

  return {
    id: `ms-${Date.now()}`,
    title,
    description,
    phase: input.phase ?? "development",
    estimatedDate: normalizeOptionalString(input.estimatedDate),
    dependencies: input.dependencies,
    deliverables: input.deliverables,
  };
}
