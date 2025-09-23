import { formatSuccessMetric } from "../formatters";
import type { SectionDefinition } from "../types";

export const SUCCESS_METRICS_SECTION: SectionDefinition = {
  title: "Success Metrics",
  overrideKeys: ["successmetrics", "metrics"],
  placeholder:
    "Provide success metrics with baseline, target, timeframe, units, and system of record for verification",
  build(state, _overrides) {
    const { successMetrics } = state.contentOutline;
    if (successMetrics.length === 0) {
      return null;
    }

    return successMetrics.map(formatSuccessMetric).join("\n");
  },
};
