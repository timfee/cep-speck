import { PATTERNS, buildPersonaHealing, voidUnused } from "../helpers";

import type { Issue } from "../types";

export const itemId = "persona-coverage";
export type Params = { personas: string[] };

function toPrompt(_params: Params, _pack?: unknown): string {
  voidUnused(_params, _pack);
  return "All personas must appear consistently in People Problems, Goals, and CUJs.";
}

// eslint-disable-next-line @typescript-eslint/require-await
async function validate(draft: string, params: Params, _pack?: unknown): Promise<Issue[]> {
  voidUnused(_pack);
  const issues: Issue[] = [];
  const defs = [
    { name: "People Problems", rx: PATTERNS.PEOPLE_PROBLEMS_SECTION },
    { name: "Goals", rx: PATTERNS.GOALS_SECTION },
    { name: "CUJs", rx: PATTERNS.CUJS_SECTION },
  ];

  for (const persona of params.personas) {
    for (const def of defs) {
      const block = draft.match(def.rx)?.[0] ?? "";
      if (!block.toLowerCase().includes(persona.toLowerCase())) {
        issues.push({
          id: "missing-persona-coverage",
          itemId,
          severity: "error",
          message: `Persona "${persona}" missing from ${def.name} section`,
          evidence: persona,
        });
      }
    }
  }

  return issues;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function heal(
  _issues: Issue[],
  _params: Params,
  _pack?: unknown
): Promise<string | null> {
  voidUnused(_issues, _params, _pack);
  return buildPersonaHealing();
}

export const itemModule = { itemId, toPrompt, validate, heal };
