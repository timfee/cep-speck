import { formatMilestone, formatTerm } from "../formatters";
import type { SectionDefinition } from "../types";

export const GO_TO_MARKET_SECTION: SectionDefinition = {
  title: "Go-to-Market",
  overrideKeys: ["gotomarket", "launchplan", "gtm"],
  placeholder:
    "Detail go-to-market plan covering launch gating, comms, training, and feedback instrumentation",
  build(state, _overrides) {
    const lines: string[] = [];
    lines.push(
      `- Rollout Strategy: ${formatTerm(state.enterpriseParameters.rolloutStrategy)}`
    );

    if (state.contentOutline.milestones.length > 0) {
      lines.push("- Key Milestones:");
      for (const milestone of state.contentOutline.milestones) {
        lines.push(`  • ${formatMilestone(milestone)}`);
      }
    }

    return lines.length > 1 ? lines.join("\n") : null;
  },
};
