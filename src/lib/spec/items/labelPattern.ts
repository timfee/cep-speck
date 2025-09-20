import { validateHeaderPattern, HEALING_TEMPLATES } from "../helpers";
import type { Issue } from "../types";

export const itemId = "label-pattern";
export type Params = { pattern: string; headerRegex?: string };

function toPrompt(params: Params, _pack?: unknown): string {
  return `Use the header label pattern: ${params.pattern} for top-level sections.`;
}

async function validate(
  draft: string,
  params: Params,
  _pack?: unknown
): Promise<Issue[]> {
  return validateHeaderPattern(draft, params, itemId);
}

async function heal(
  _issues: Issue[],
  params: Params,
  _pack?: unknown
): Promise<string | null> {
  return HEALING_TEMPLATES.HEADER_PATTERN(params.pattern);
}

export const itemModule = { itemId, toPrompt, validate, heal };
