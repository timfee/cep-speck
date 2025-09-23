import { formatList, formatTerm } from "../formatters";
import type { SectionDefinition } from "../types";

export const TECHNICAL_CONSIDERATIONS_SECTION: SectionDefinition = {
  title: "Technical Considerations",
  overrideKeys: ["technicalconsiderations", "technicalarchitecture"],
  placeholder:
    "Summarize deployment, security controls, dependencies, and support considerations for the rollout",
  build(state, _overrides) {
    const lines: string[] = [];
    const { enterpriseParameters } = state;

    lines.push(
      `- Deployment Model: ${formatTerm(enterpriseParameters.deploymentModel)}`
    );
    lines.push(
      `- Security Requirements: ${formatList(
        enterpriseParameters.securityRequirements.map(formatTerm),
        "No specialized controls recorded"
      )}`
    );
    lines.push(
      `- Integrations: ${formatList(
        enterpriseParameters.integrations.map(formatTerm),
        "No upstream integrations identified"
      )}`
    );
    lines.push(
      `- Support Level: ${formatTerm(enterpriseParameters.supportLevel)}`
    );

    const dependencyLines = state.contentOutline.functionalRequirements
      .filter((req) => (req.dependencies ?? []).length > 0)
      .flatMap((req) =>
        (req.dependencies ?? []).map(
          (dep) => `  • ${req.title}: depends on ${formatTerm(dep)}`
        )
      );

    if (dependencyLines.length > 0) {
      lines.push("Dependencies:");
      lines.push(...dependencyLines);
    }

    return lines.join("\n").trim();
  },
};
