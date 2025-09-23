import { summarizeMetrics, formatMilestone } from "../formatters";
import type { SectionDefinition } from "../types";

export const TLDR_SECTION: SectionDefinition = {
  title: "TL;DR",
  overrideKeys: ["tldr", "tl;dr", "executivesummary"],
  placeholder:
    "Summarize the opportunity, proposed solution, critical metrics, and near-term milestone for executive readers",
  build(state, _overrides) {
    const lines: string[] = [];
    const summary = state.contentOutline.executiveSummary;

    if (summary !== undefined) {
      lines.push(`- Problem Statement: ${summary.problemStatement}`);
      lines.push(`- Proposed Solution: ${summary.proposedSolution}`);
      lines.push(`- Business Value: ${summary.businessValue}`);
    } else if (state.initialPrompt.trim().length > 0) {
      lines.push(state.initialPrompt.trim());
    }

    const targetUsers = summary?.targetUsers;
    if (typeof targetUsers === "string" && targetUsers.trim().length > 0) {
      lines.push(`- Target Users: ${targetUsers}`);
    }

    const metricsSummary = summarizeMetrics(
      state.contentOutline.successMetrics
    );
    if (metricsSummary.length > 0) {
      lines.push("");
      lines.push("Key Metrics:");
      for (const metricLine of metricsSummary) {
        lines.push(`- ${metricLine}`);
      }
    }

    if (state.contentOutline.milestones.length > 0) {
      const milestoneDetail = formatMilestone(
        state.contentOutline.milestones[0]
      );
      lines.push("");
      lines.push(`Near-term Milestone: ${milestoneDetail}`);
    }

    return lines.length > 0 ? lines.join("\n").trim() : null;
  },
};
