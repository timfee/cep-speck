import { PATTERNS, buildMetricHealing, voidUnused } from "../helpers";

import type { Issue } from "../types";

export const itemId = "metrics-required";
export type Params = {
  require: ("units" | "timeframe" | "SoT")[];
  metricRegex: string;
};

// Constants
const MAX_EVIDENCE_LENGTH = 70;

function toPrompt(params: Params, _pack?: unknown): string {
  voidUnused(_pack);
  return `Every metric must include: ${params.require.join(
    ", "
  )}. Identify metric lines by regex: ${params.metricRegex}`;
}

async function validate(draft: string, params: Params, _pack?: unknown): Promise<Issue[]> {
  voidUnused(_pack);
  const rx = new RegExp(params.metricRegex, "gm");
  // Find the Success Metrics section first
  const metricsSection = draft.match(PATTERNS.SUCCESS_METRICS_SECTION)?.[0] ?? "";
  if (!metricsSection) return []; // No metric section, not this validator's problem.

  const metricLines = metricsSection.split("\n").filter((l) => rx.test(l));
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
        evidence: line.length > MAX_EVIDENCE_LENGTH ? line.substring(0, MAX_EVIDENCE_LENGTH) + "..." : line,
        hints: missing.map((m) => `missing:${m}`),
      });
    }
  }
  return issues;
}

async function heal(issues: Issue[], params: Params, _pack?: unknown): Promise<string | null> {
  voidUnused(_pack);
  return buildMetricHealing(issues, params);
}

export const itemModule = { itemId, toPrompt, validate, heal };
