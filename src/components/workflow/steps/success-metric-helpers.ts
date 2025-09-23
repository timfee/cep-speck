import type { SuccessMetric } from "@/types/workflow";

import { createSuccessMetric } from "./entity-factory";

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
