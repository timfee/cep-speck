import type { Issue } from "../types";

export const itemId = "placeholder-quality";
// No Params type required

// Constants for pattern matching
const METRIC_KEYWORDS = /(baseline|target|metric)/i;
const UNIT_KEYWORDS = /(minutes|hours|days|%|count|users)/i;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toPrompt(_params: Record<string, never>, _pack?: unknown): string {
  return "Placeholders must be specific: include data, units, timeframe, and source.";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validate(draft: string, _params: Record<string, never>, _pack?: unknown): Issue[] {
  const issues: Issue[] = [];
  const placeholders = draft.match(/\[PM_INPUT_NEEDED:[^\]]+\]/g) || [];

  for (const ph of placeholders) {
    const content = ph.match(/\[PM_INPUT_NEEDED:\s*([^\]]+)\]/)?.[1] || "";

    // Check for vague placeholders (< 3 words)
    if (content.trim().split(/\s+/).length < 3) {
      issues.push({
        id: "vague-placeholder",
        itemId,
        severity: "warn",
        message: `Placeholder too vague: "${ph}"`,
        evidence: ph,
      });
    }

    // Check for metric placeholders missing units
    if (METRIC_KEYWORDS.test(content) && !UNIT_KEYWORDS.test(content)) {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function heal(issues: Issue[], _params: Record<string, never>, _pack?: unknown): string | null {
  if (!issues.length) return null;
  return "Make placeholders more specific by including units, timeframes, and data sources. Use at least 3 words and include units for metric-related placeholders.";
}

export type Params = Record<string, never>;
export const itemModule = { itemId, toPrompt, validate, heal };
