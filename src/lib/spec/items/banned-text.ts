import {
  createWordBoundaryRegex,
  createFlexibleRegex,
} from "../helpers/patterns";

import type { Issue, SpecPack } from "../types";

export const itemId = "banned-text";
export type Params = {
  listsFromPack?: boolean;
  extra?: { exact?: string[]; regex?: string[] };
};

// Constants
const MAX_EVIDENCE_LENGTH = 50;

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

async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  const exact = collectExact(params, pack);
  const regex = collectRegex(params, pack);
  const issues: Issue[] = [];

  for (const word of exact) {
    if (!word) continue;
    const re = createWordBoundaryRegex(word, "i");
    const match = draft.match(re);
    if (match) {
      issues.push({
        id: "banned-exact",
        itemId,
        severity: "error",
        message: `contains banned term: "${word}"`,
        evidence: match[0],
      });
    }
  }

  for (const pattern of regex) {
    if (!pattern) continue;
    const re = createFlexibleRegex(pattern);
    const match = draft.match(re);
    if (match) {
      issues.push({
        id: "banned-regex",
        itemId,
        severity: "error",
        message: `matches banned pattern: ${pattern}`,
        evidence:
          match[0].length > MAX_EVIDENCE_LENGTH
            ? match[0].substring(0, MAX_EVIDENCE_LENGTH) + "..."
            : match[0],
      });
    }
  }
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };
