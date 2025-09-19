import type { Issue } from "../types";
import { extractSection, PATTERNS, buildConsistencyHealing, voidUnused } from "../helpers";

export const itemId = "cross-section-consistency";
export type Params = { metricRegex?: string };

function extractMetrics(block: string, params: Params): Map<string, string> {
  // Extract metrics using pattern: - <metric>: <value> or * <metric>: <value>
  // The ([^#].*) pattern captures values up to a # character to handle inline comments
  const map = new Map<string, string>();
  const defaultPattern = /^[-*]\s+([^:]+):\s+([^#].*)$/;
  const customPattern = params.metricRegex
    ? new RegExp(params.metricRegex)
    : null;

  for (const line of block.split("\n")) {
    if (customPattern) {
      // Use custom regex if provided
      const matches = line.match(customPattern);
      if (matches && matches.length >= 3) {
        const key = matches[1]?.trim().toLowerCase();
        const value = matches[2]?.trim();
        if (key && value) {
          map.set(key, value);
        }
      }
    } else {
      // Use default pattern
      const m = line.match(defaultPattern);
      if (m) map.set(m[1].trim().toLowerCase(), m[2].trim());
    }
  }
  return map;
}

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
