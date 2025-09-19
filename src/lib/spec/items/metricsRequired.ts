import type { Issue } from "../types";
import { PATTERNS, buildMetricHealing, voidUnused } from "../helpers";

export const itemId = "metrics-required";
export type Params = {
  require: ("units" | "timeframe" | "SoT")[];
  metricRegex: string;
};

function toPrompt(params: Params, _pack?: unknown): string {
  voidUnused(_pack);
  return `Every metric must include: ${params.require.join(
    ", "
  )}. Identify metric lines by regex: ${params.metricRegex}`;
}

function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  voidUnused(_pack);
  const rx = new RegExp(params.metricRegex, "gm");
  const metricLines = draft.split("\n").filter((l) => rx.test(l));
  const issues: Issue[] = [];
  
  for (const line of metricLines) {
    const missing: string[] = [];
    
    if (params.require.includes("timeframe") && !PATTERNS.TIMEFRAME_INDICATORS.test(line))
      missing.push("timeframe");
    if (params.require.includes("units") && !PATTERNS.METRIC_UNITS.test(line))
      missing.push("units");
    if (params.require.includes("SoT") && !PATTERNS.SOURCE_OF_TRUTH.test(line))
      missing.push("SoT");
      
    if (missing.length) {
      issues.push({
        id: "metrics-missing-attrs",
        itemId,
        severity: "error",
        message: `metric missing: ${missing.join(", ")}`,
        evidence: line,
        hints: missing.map((m) => `missing:${m}`),
      });
    }
  }
  return issues;
}

function heal(issues: Issue[], params: Params, _pack?: unknown): string | null {
  voidUnused(_pack);
  return buildMetricHealing(issues, params);
}

export const itemModule = { itemId, toPrompt, validate, heal };
