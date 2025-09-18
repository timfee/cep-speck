import type { Issue } from "../types";

export const itemId = "section-count";
export type Params = {
  exact?: number;
  min?: number;
  max?: number;
  headerRegex: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toPrompt(params: Params, _pack?: unknown): string {
  const range =
    params.exact != null
      ? `exactly ${params.exact}`
      : `${params.min ?? "?"}..${params.max ?? "?"}`;
  return `Ensure the document has ${range} top-level sections; detect sections using headerRegex: ${params.headerRegex}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  const rx = new RegExp(params.headerRegex, "gm");
  const matches = draft.match(rx) ?? [];
  const count = matches.length;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function heal(issues: Issue[], params: Params, _pack?: unknown): string | null {
  if (!issues.length) return null;
  const range =
    params.exact != null
      ? `exactly ${params.exact}`
      : `${params.min ?? "?"}..${params.max ?? "?"}`;
  return `Adjust the number of top-level sections to ${range}. Keep compliant sections; add or trim minimally. Maintain header pattern ${params.headerRegex}.`;
}

export const itemModule = { itemId, toPrompt, validate, heal };
