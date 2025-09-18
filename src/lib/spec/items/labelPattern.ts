import type { Issue } from "../types";

export const itemId = "label-pattern";
export type Params = { pattern: string; headerRegex?: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toPrompt(params: Params, _pack?: unknown): string {
  return `Use the header label pattern: ${params.pattern} for top-level sections.`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  const lines = draft.split("\n").filter(Boolean);
  const hdrRx = params.headerRegex
    ? new RegExp(params.headerRegex)
    : /^#\s+\d+\./;
  const issues: Issue[] = [];
  for (const line of lines) {
    if (hdrRx.test(line)) {
      if (!/^#\s+\d+\.\s+/.test(line)) {
        issues.push({
          id: "label-pattern-mismatch",
          itemId,
          severity: "error",
          message: `header not matching pattern: ${params.pattern}`,
          evidence: line,
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
  return `Conform section headers to the label pattern "# {n}. {title}" (e.g., "# 1. TL;DR").`;
}

export const itemModule = { itemId, toPrompt, validate, heal };
