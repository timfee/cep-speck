import { PATTERNS, LIMITS, HEALING_TEMPLATES, voidUnused } from "../helpers";

import type { Issue } from "../types";

export const itemId = "placeholder-quality";
// No Params type required

function toPrompt(_params: Record<string, never>, _pack?: unknown): string {
  voidUnused(_params, _pack);
  return "Placeholders must be specific: include data, units, timeframe, and source.";
}

function validate(
  draft: string,
  _params: Record<string, never>,
  _pack?: unknown
): Issue[] {
  voidUnused(_params, _pack);
  const issues: Issue[] = [];
  const placeholders = draft.match(PATTERNS.PLACEHOLDER) ?? [];

  for (const ph of placeholders) {
    const content = ph.match(PATTERNS.PLACEHOLDER_CONTENT)?.[1] ?? "";

    // Check for vague placeholders (< 3 words)
    if (content.trim().split(/\s+/).length < LIMITS.PLACEHOLDER_MIN_WORDS) {
      issues.push({
        id: "vague-placeholder",
        itemId,
        severity: "warn",
        message: `Placeholder too vague: "${ph}"`,
        evidence: ph,
      });
    }

    // Check for metric placeholders missing units
    if (PATTERNS.METRIC_KEYWORDS.test(content) && !PATTERNS.UNIT_KEYWORDS.test(content)) {
      issues.push({
        id: "placeholder-missing-units",
        itemId,
        severity: "error",
        message: `Metric placeholder missing units: "${ph}"`,
        evidence: ph,
      });
    }
  }

  return issues;
}

function heal(
  issues: Issue[],
  _params: Record<string, never>,
  _pack?: unknown
): string | null {
  voidUnused(_params, _pack);
  if (!issues.length) return null;
  return HEALING_TEMPLATES.IMPROVE_PLACEHOLDERS;
}

export type Params = Record<string, never>;
export const itemModule = { itemId, toPrompt, validate, heal };
