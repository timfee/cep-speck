import { PATTERNS, LIMITS } from "../helpers";
import type { Issue } from "../types";

export const itemId = "placeholder-quality";
export type Params = {
  minWords?: number;
  requireUnitsForMetrics?: boolean;
};

function toPrompt(params: Params, _pack?: unknown): string {
  const minWords = params.minWords ?? LIMITS.PLACEHOLDER_MIN_WORDS;
  const parts = [
    `Placeholders must be specific with at least ${minWords} words describing what data is needed.`,
  ];

  if (params.requireUnitsForMetrics !== false) {
    parts.push(
      "For metric placeholders (baseline, target, KPI), include units, timeframe, and source of truth."
    );
  }

  return parts.join(" ");
}

async function validate(
  draft: string,
  params: Params,
  _pack?: unknown
): Promise<Issue[]> {
  const issues: Issue[] = [];
  const placeholders = draft.match(PATTERNS.PLACEHOLDER) ?? [];
  const minWords = params.minWords ?? LIMITS.PLACEHOLDER_MIN_WORDS;
  const requireUnitsForMetrics = params.requireUnitsForMetrics !== false;

  for (const ph of placeholders) {
    const content = ph.match(PATTERNS.PLACEHOLDER_CONTENT)?.[1] ?? "";

    // Check for vague placeholders
    if (content.trim().split(/\s+/).length < minWords) {
      issues.push({
        id: "vague-placeholder",
        itemId,
        severity: "warn",
        message: `Placeholder too vague: "${ph}" (needs at least ${minWords} words)`,
        evidence: ph,
      });
    }

    // Check for metric placeholders missing units
    if (
      requireUnitsForMetrics &&
      PATTERNS.METRIC_KEYWORDS.test(content) &&
      !PATTERNS.UNIT_KEYWORDS.test(content)
    ) {
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

export const itemModule = { itemId, toPrompt, validate };
