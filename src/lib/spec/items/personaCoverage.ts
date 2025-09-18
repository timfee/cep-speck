import type { Issue } from "../types";

export const itemId = "persona-coverage";
export type Params = { personas: string[] };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toPrompt(_params: Params, _pack?: unknown): string {
  return "All personas must appear consistently in People Problems, Goals, and CUJs.";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  const issues: Issue[] = [];
  const defs = [
    { name: "People Problems", rx: /# 2\. People Problems[\s\S]*?(?=# 3\.|$)/ },
    { name: "Goals", rx: /# 4\. Goals[\s\S]*?(?=# 5\.|$)/ },
    { name: "CUJs", rx: /# 5\. CUJs[\s\S]*?(?=# 6\.|$)/ },
  ];

  for (const persona of params.personas) {
    for (const def of defs) {
      const block = draft.match(def.rx)?.[0] || "";
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

 
function heal(
  _issues: Issue[],
  _params: Params,
  _pack?: unknown
): string | null {
  return `Ensure each persona appears in all required sections:
1. People Problems: tie at least one bullet per persona to a concrete pain.
2. Goals: include persona perspective (e.g., "IT Admin reduces...", "End User experiences...").
3. CUJs: write at least one journey per persona or annotate shared journeys with persona tags.
4. Avoid generic plural nouns; use explicit persona labels so automation can detect coverage.`;
}

export const itemModule = { itemId, toPrompt, validate, heal };
