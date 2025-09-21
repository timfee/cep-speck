import { createWordBoundaryRegex, extractSection } from "../helpers";
import type { Issue } from "../types";

export const itemId = "metrics-required";
export type Params = {
  require: ("units" | "timeframe" | "SoT")[];
  metricRegex: string;
};

// Constants
const MAX_EVIDENCE_LENGTH = 70;

function toPrompt(params: Params, _pack?: unknown): string {
  return `Every metric must include: ${params.require.join(
    ", "
  )}. Identify metric lines by regex: ${params.metricRegex}`;
}

async function validate(
  draft: string,
  params: Params,
  _pack?: unknown
): Promise<Issue[]> {
  const metricLines = extractMetricLines(draft, params.metricRegex);
  const issues: Issue[] = [];

  for (const line of metricLines) {
    const missing = validateSingleMetricLine(line, params.require);

    if (missing.length > 0) {
      issues.push(createMetricIssue(line, missing));
    }
  }

  return issues;
}

/**
 * Extracts metric lines from the draft content
 */
function extractMetricLines(draft: string, metricRegex: string): string[] {
  const rx = new RegExp(metricRegex, "gm");
  const sectionPattern = /^#\s+\d+\.\s+Success Metrics.*?(?=^#|\$)/gm;
  const metricsSection = extractSection(draft, sectionPattern);
  if (!metricsSection) return [];

  return metricsSection.split("\n").filter((l) => rx.test(l));
}

/**
 * Validates a single metric line for required attributes
 */
function validateSingleMetricLine(
  line: string,
  require: ("units" | "timeframe" | "SoT")[]
): string[] {
  const missing: string[] = [];

  // Check timeframe
  if (require.includes("timeframe")) {
    const timeframePatterns = [
      "within",
      "by",
      "Q[1-4]\\s*'?[0-9]{2}",
      "H[1-2]\\s*'?[0-9]{2}",
      "FY[0-9]{2}",
      "[0-9]+\\s*(days?|weeks?|months?|quarters?)",
    ];
    const hasTimeframe = timeframePatterns.some((pattern) => {
      const regex = createWordBoundaryRegex(pattern);
      return regex.test(line);
    });
    if (!hasTimeframe) missing.push("timeframe");
  }

  // Check units
  if (require.includes("units")) {
    const unitsPatterns = [
      "%",
      "ms",
      "seconds?",
      "minutes?",
      "days?",
      "count",
      "users?",
      "admins?",
      "GiB",
      "MiB",
      "KB",
      "MB",
      "GB",
      "TB",
    ];
    const hasUnits = unitsPatterns.some((pattern) => {
      const regex = createWordBoundaryRegex(pattern);
      return regex.test(line);
    });
    if (!hasUnits) missing.push("units");
  }

  // Check SoT
  if (require.includes("SoT")) {
    const sotPatterns = [
      "SoT",
      "Source of Truth",
      "CBCM",
      "Telemetry",
      "Analytics",
      "Looker",
      "Admin Console",
      "Plx",
      "BigQuery",
      "Dashboard",
    ];
    const hasSoT = sotPatterns.some((pattern) => {
      const regex = createWordBoundaryRegex(pattern);
      return regex.test(line);
    });
    if (!hasSoT) missing.push("SoT");
  }

  return missing;
}

/**
 * Creates a metric validation issue
 */
function createMetricIssue(line: string, missing: string[]): Issue {
  const evidence =
    line.length > MAX_EVIDENCE_LENGTH
      ? line.substring(0, MAX_EVIDENCE_LENGTH) + "..."
      : line;

  return {
    id: "metrics-missing-attrs",
    itemId,
    severity: "error",
    message: `metric missing: ${missing.join(", ")}`,
    evidence,
    hints: missing.map((m) => `missing:${m}`),
  };
}

export const itemModule = { itemId, toPrompt, validate };
