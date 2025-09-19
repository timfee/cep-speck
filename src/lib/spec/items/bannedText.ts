import {
  createWordBoundaryRegex,
  createFlexibleRegex,
  HEALING_TEMPLATES,
  voidUnused,
} from "../helpers";

import type { Issue, SpecPack } from "../types";

export const itemId = "banned-text";
export type Params = {
  listsFromPack?: boolean;
  extra?: { exact?: string[]; regex?: string[] };
};

function collectExact(params: Params, pack?: SpecPack): string[] {
  return [
    ...(params.extra?.exact ?? []),
    ...(params.listsFromPack === true
      ? (pack?.globals?.bannedText?.exact ?? [])
      : []),
  ];
}

function collectRegex(params: Params, pack?: SpecPack): string[] {
  return [
    ...(params.extra?.regex ?? []),
    ...(params.listsFromPack === true
      ? (pack?.globals?.bannedText?.regex ?? [])
      : []),
  ];
}

function toPrompt(params: Params, pack?: SpecPack): string {
  const exact = collectExact(params, pack);
  const regex = collectRegex(params, pack);
  return `Avoid banned terms. Exact: ${exact.join(", ")}. Regex: ${regex.join(
    " | "
  )}.`;
}

function validate(draft: string, params: Params, pack?: SpecPack): Issue[] {
  const exact = collectExact(params, pack);
  const regex = collectRegex(params, pack);
  const issues: Issue[] = [];

  for (const word of exact) {
    if (!word) continue;
    const re = createWordBoundaryRegex(word, "i");
    if (re.test(draft)) {
      issues.push({
        id: "banned-exact",
        itemId,
        severity: "error",
        message: `contains banned term "${word}"`,
      });
    }
  }

  for (const pattern of regex) {
    if (!pattern) continue;
    const re = createFlexibleRegex(pattern);
    if (re.test(draft)) {
      issues.push({
        id: "banned-regex",
        itemId,
        severity: "error",
        message: `matches banned pattern ${pattern}`,
      });
    }
  }
  return issues;
}

function heal(
  issues: Issue[],
  _params: Params,
  _pack?: SpecPack
): string | null {
  voidUnused(_params, _pack);
  if (!issues.length) return null;
  return HEALING_TEMPLATES.BANNED_TEXT;
}

export const itemModule = { itemId, toPrompt, validate, heal };
