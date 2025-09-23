import type { SectionDefinition } from "../types";

export const KEY_PERSONAS_SECTION: SectionDefinition = {
  title: "Key Personas",
  overrideKeys: ["keypersonas", "personas"],
  placeholder:
    "Identify primary personas (role, environment, device posture) and note differentiating needs for Chrome Enterprise Premium",
  build(state, _overrides) {
    const summary = state.contentOutline.executiveSummary;
    const personaSource = summary?.targetUsers;
    if (typeof personaSource !== "string") {
      return null;
    }

    const personas = personaSource
      .split(/[,;\n]/)
      .map((persona) => persona.trim())
      .filter(Boolean)
      .map((persona) => `- ${persona}`);

    if (personas.length === 0) {
      return null;
    }

    return ["Primary admin and security personas impacted:", ...personas].join(
      "\n"
    );
  },
};
