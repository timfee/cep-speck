import type { SectionDefinition } from "../types";

export const GOALS_SECTION: SectionDefinition = {
  title: "Goals",
  overrideKeys: ["goals", "objectives", "outcomes"],
  placeholder:
    "Define measurable business goals mapped to the quantified problems and success metrics",
  build(state, _overrides) {
    const metrics = state.contentOutline.successMetrics;
    if (metrics.length === 0) {
      return null;
    }

    return metrics
      .map((metric) => `- ${metric.name}: ${metric.description}`)
      .join("\n");
  },
};
