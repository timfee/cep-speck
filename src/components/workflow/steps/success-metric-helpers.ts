import type { SuccessMetric } from "@/types/workflow";

import { createSuccessMetric } from "./entity-factory";
import type { SuccessMetricDraft } from "./hooks/outline-editor-types";
import type { OutlineEntityDescriptor } from "./outline-entity-descriptor";

export interface SuccessMetricInput
  extends Pick<SuccessMetric, "name" | "description">,
    Partial<Omit<SuccessMetric, "id" | "name" | "description">> {
  type?: SuccessMetric["type"];
}

export function createNewSuccessMetric(
  input: SuccessMetricInput
): SuccessMetric {
  return createSuccessMetric(input);
}

export const successMetricDescriptor: OutlineEntityDescriptor<
  SuccessMetric,
  SuccessMetricDraft
> = {
  idKey: "id",
  defaults: () => ({
    name: "",
    description: "",
    type: "engagement",
  }),
  toDraft: (item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    type: item.type,
    target: item.target,
    measurement: item.measurement,
    frequency: item.frequency,
    owner: item.owner,
  }),
  fromDraft: (draft, fallbackId) => {
    const created = createSuccessMetric({
      name: draft.name,
      description: draft.description,
      type: draft.type,
      target: draft.target,
      measurement: draft.measurement,
      frequency: draft.frequency,
      owner: draft.owner,
    });

    const id = draft.id ?? fallbackId ?? created.id;
    return { ...created, id };
  },
};
