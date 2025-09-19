import {
  validateHeaderPattern,
  HEALING_TEMPLATES,
  voidUnused,
} from "../helpers";

import type { Issue } from "../types";

export const itemId = "label-pattern";
export type Params = { pattern: string; headerRegex?: string };

function toPrompt(params: Params, _pack?: unknown): string {
  voidUnused(_pack);
  return `Use the header label pattern: ${params.pattern} for top-level sections.`;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function validate(draft: string, params: Params, _pack?: unknown): Promise<Issue[]> {
  voidUnused(_pack);
  return validateHeaderPattern(draft, params, itemId);
}

// eslint-disable-next-line @typescript-eslint/require-await
async function heal(
  _issues: Issue[],
  params: Params,
  _pack?: unknown
): Promise<string | null> {
  voidUnused(_issues, _pack);
  return HEALING_TEMPLATES.HEADER_PATTERN(params.pattern);
}

export const itemModule = { itemId, toPrompt, validate, heal };
