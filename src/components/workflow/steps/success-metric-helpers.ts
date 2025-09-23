import type { SuccessMetric } from "@/types/workflow";

import {
  normalizeOptionalString,
  requireMeaningfulField,
} from "./outline-text-utils";

export interface SuccessMetricInput
  extends Pick<SuccessMetric, "name" | "description">,
    Partial<Omit<SuccessMetric, "id" | "name" | "description">> {
  type?: SuccessMetric["type"];
}

export function createNewSuccessMetric(
  input: SuccessMetricInput
): SuccessMetric {
  const name = requireMeaningfulField(input.name, {
    empty: "Success metrics require a name and description.",
    placeholder:
      "Replace the placeholder with a meaningful success metric name.",
  });
  const description = requireMeaningfulField(input.description, {
    empty: "Success metrics require a name and description.",
    placeholder:
      "Describe how the success metric will be evaluated instead of using placeholder text.",
  });

  return {
    id: `sm-${Date.now()}`,
    name,
    description,
    type: input.type ?? "engagement",
    target: normalizeOptionalString(input.target),
    measurement: normalizeOptionalString(input.measurement),
    frequency: normalizeOptionalString(input.frequency),
    owner: normalizeOptionalString(input.owner),
  };
}
