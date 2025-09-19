import type { Issue } from "../types";
import {
  validateHeaderPattern,
  HEALING_TEMPLATES,
  voidUnused,
} from "../helpers";

export const itemId = "label-pattern";
export type Params = { pattern: string; headerRegex?: string };

function toPrompt(params: Params, _pack?: unknown): string {
  voidUnused(_pack);
  return `Use the header label pattern: ${params.pattern} for top-level sections.`;
}

function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  voidUnused(_pack);
  return validateHeaderPattern(draft, params, itemId);
}

function heal(
  _issues: Issue[],
  params: Params,
  _pack?: unknown
): string | null {
  voidUnused(_issues, _pack);
  return HEALING_TEMPLATES.HEADER_PATTERN(params.pattern);
}

export const itemModule = { itemId, toPrompt, validate, heal };
