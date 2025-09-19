import {
  extractSection,
  extractBulletPoints,
  doesMetricReferenceFeature,
  buildTraceabilityHealing,
  voidUnused,
} from "../helpers";

import type { Issue } from "../types";

export const itemId = "traceability-complete";
// No Params type required

// Configuration constants for matching algorithms
const PROBLEM_SUBSTRING_LENGTH = 30;

function section(draft: string, rx: RegExp): string {
  return extractSection(draft, rx);
}

function bullets(block: string): string[] {
  return extractBulletPoints(block);
}

function toPrompt(_params: Record<string, never>, _pack?: unknown): string {
  voidUnused(_params, _pack);
  return "Ensure every problem maps to a feature and every feature has at least one success metric.";
}

function validate(
  draft: string,
  _params: Record<string, never>,
  _pack?: unknown
): Issue[] {
  voidUnused(_params, _pack);
  const issues: Issue[] = [];
  const problemBlock = section(
    draft,
    /# 2\. People Problems[\s\S]*?(?=# 3\.|$)/
  );
  const featureBlock = section(
    draft,
    /# 6\. Functional Requirements[\s\S]*?(?=# 7\.|$)/
  );
  const metricsBlock = section(
    draft,
    /# 8\. Success Metrics[\s\S]*?(?=# 9\.|$)/
  );

  const problems = bullets(problemBlock);
  // Rough feature segmentation by headings
  const featureSegments = featureBlock.split(/## F\d+ —/).slice(1); // discard preamble
  const features = featureSegments.map((s) => s.split("\n")[0].trim());
  const metrics = bullets(metricsBlock);

  // Check that each problem is referenced by at least one feature
  for (const p of problems) {
    const ref = featureSegments.some((seg) =>
      seg
        .toLowerCase()
        .includes(p.toLowerCase().slice(0, PROBLEM_SUBSTRING_LENGTH))
    );
    if (!ref) {
      issues.push({
        id: "orphaned-problem",
        itemId,
        severity: "error",
        message: `Problem has no corresponding feature: "${p}"`,
        evidence: p,
      });
    }
  }

  // Check that each feature has at least one success metric
  for (let i = 0; i < featureSegments.length; i++) {
    const name = features[i];
    const hasMetric = metrics.some((m) => doesMetricReferenceFeature(m, name));
    if (!hasMetric) {
      issues.push({
        id: "unmeasured-feature",
        itemId,
        severity: "error",
        message: `Feature has no success metric: "${name}"`,
        evidence: name,
      });
    }
  }

  return issues;
}

function heal(
  _issues: Issue[],
  _params: Record<string, never>,
  _pack?: unknown
): string | null {
  voidUnused(_issues, _params, _pack);
  return buildTraceabilityHealing();
}

export type Params = Record<string, never>;
export const itemModule = { itemId, toPrompt, validate, heal };
