import { extractSection, extractMetrics, PATTERNS, buildConsistencyHealing, voidUnused } from "../helpers";

import type { Issue } from "../types";


export const itemId = "cross-section-consistency";
export type Params = { metricRegex?: string };

function toPrompt(_params: Params, _pack?: unknown): string {
  voidUnused(_params, _pack);
  return "Metrics in TL;DR must exactly match values in Success Metrics section.";
}

function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  voidUnused(_pack);
  const issues: Issue[] = [];
  const tldr = extractSection(draft, PATTERNS.TLDR_SECTION);
  const success = extractSection(draft, PATTERNS.SUCCESS_METRICS_SECTION);
  
  const a = extractMetrics(tldr, params);
  const b = extractMetrics(success, params);
  
  for (const [k, v] of a) {
    if (b.has(k) && b.get(k) !== v) {
      issues.push({
        id: "metric-inconsistency",
        itemId,
        severity: "error",
        message: `Conflicting metrics: "${k}" is ${v} in TL;DR but ${b.get(
          k
        )} in Success Metrics`,
        evidence: `${k}: ${v} | ${b.get(k)}`,
      });
    }
  }
  return issues;
}

function heal(
  _issues?: Issue[],
  _params?: Params,
  _pack?: unknown
): string | null {
  voidUnused(_issues, _params, _pack);
  return buildConsistencyHealing();
}

export const itemModule = { itemId, toPrompt, validate, heal };
