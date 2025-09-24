import { validateHeaderPattern } from "../helpers/validation";
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

export const itemModule = { itemId, toPrompt, validate };
