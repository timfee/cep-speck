import type { MilestoneDraft } from "@/lib/workflow/outline-editor-types";
import type { Milestone } from "@/types/workflow";

import { createMilestone } from "./entity-factory";
import type { OutlineEntityDescriptor } from "./outline-entity-descriptor";

export interface MilestoneInput
  extends Pick<Milestone, "title" | "description">,
    Partial<Omit<Milestone, "id" | "title" | "description">> {
  phase?: Milestone["phase"];
}

export function createNewMilestone(input: MilestoneInput): Milestone {
  return createMilestone(input);
}

export const milestoneDescriptor: OutlineEntityDescriptor<
  Milestone,
  MilestoneDraft
> = {
  idKey: "id",
  defaults: () => ({
    title: "",
    description: "",
    phase: "development",
  }),
  toDraft: (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    phase: item.phase,
    estimatedDate: item.estimatedDate,
    dependencies: item.dependencies,
    deliverables: item.deliverables,
  }),
  fromDraft: (draft, fallbackId) => {
    const created = createMilestone({
      title: draft.title,
      description: draft.description,
      phase: draft.phase,
      estimatedDate: draft.estimatedDate,
      dependencies: draft.dependencies,
      deliverables: draft.deliverables,
    });

    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
};
