import type { SectionDefinition } from "../types";

export const PEOPLE_PROBLEMS_SECTION: SectionDefinition = {
  title: "People Problems",
  overrideKeys: ["peopleproblems", "problems", "painpoints"],
  placeholder:
    "Document top 3 user or admin problems with supporting telemetry, qualitative research, and quantified impact",
  build(state, _overrides) {
    const derived = state.contentOutline.functionalRequirements
      .filter((req) => req.description.trim().length > 0)
      .map((req) => `- ${req.title}: ${req.description}`);

    if (derived.length > 0) {
      return [
        "Observed operational gaps tied to user feedback and telemetry:",
        ...derived,
      ].join("\n");
    }

    return null;
  },
};
