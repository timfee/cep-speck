import { countSections, HEALING_TEMPLATES, voidUnused } from "../helpers";

import type { Issue } from "../types";

export const itemId = "section-count";
export type Params = {
  exact?: number;
  min?: number;
  max?: number;
  headerRegex: string;
};

function toPrompt(params: Params, _pack?: unknown): string {
  voidUnused(_pack);
  const range =
    params.exact != null
      ? `exactly ${params.exact}`
      : `${params.min ?? "?"}..${params.max ?? "?"}`;
  return `Ensure the document has ${range} top-level sections; detect sections using headerRegex: ${params.headerRegex}`;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function validate(draft: string, params: Params, _pack?: unknown): Promise<Issue[]> {
  voidUnused(_pack);
  const count = countSections(draft, params.headerRegex);
  const issues: Issue[] = [];

  const ok =
    (params.exact != null && count === params.exact) ||
    (params.exact == null &&
      (params.min == null || count >= params.min) &&
      (params.max == null || count <= params.max));

  if (!ok) {
    issues.push({
      id: "section-count-mismatch",
      itemId,
      severity: "error",
      message: `found ${count} sections; expected ${
        params.exact ?? `${params.min ?? 0}..${params.max ?? "∞"}`
      }`,
      evidence: String(count),
    });
  }
  return issues;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function heal(issues: Issue[], params: Params, _pack?: unknown): Promise<string | null> {
  voidUnused(_pack);
  if (!issues.length) return null;

  const range =
    params.exact != null
      ? `exactly ${params.exact}`
      : `${params.min ?? "?"}..${params.max ?? "?"}`;

  return HEALING_TEMPLATES.SECTION_COUNT(range, params.headerRegex);
}

export const itemModule = { itemId, toPrompt, validate, heal };
