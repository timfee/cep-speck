import { formatFunctionalRequirement } from "../formatters";
import type { SectionDefinition } from "../types";

export const FUNCTIONAL_REQUIREMENTS_SECTION: SectionDefinition = {
  title: "Functional Requirements",
  overrideKeys: ["functionalrequirements", "featurerequirements"],
  placeholder:
    "Detail prioritized functional requirements with SKU callouts, acceptance criteria, dependencies, and instrumentation plan",
  build(state, _overrides) {
    const { functionalRequirements } = state.contentOutline;
    if (functionalRequirements.length === 0) {
      return null;
    }

    return functionalRequirements.map(formatFunctionalRequirement).join("\n");
  },
};
