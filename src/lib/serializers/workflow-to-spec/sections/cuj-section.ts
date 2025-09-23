import type { SectionDefinition } from "../types";

export const CUJ_SECTION: SectionDefinition = {
  title: "CUJs",
  overrideKeys: ["cujs", "customerjourneys"],
  placeholder:
    "Outline critical user journeys with trigger, key steps, systems touched, and success criteria",
  build(state, _overrides) {
    const cujLines = state.contentOutline.functionalRequirements
      .filter((req) => (req.userStory ?? "").trim().length > 0)
      .map((req) => `- ${req.userStory} (enables: ${req.title})`);

    if (cujLines.length === 0) {
      return null;
    }

    return [
      "Critical user journeys traced to problems and features:",
      ...cujLines,
    ].join("\n");
  },
};
