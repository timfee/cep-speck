import type { Issue } from "../types";

export const MAX_EVIDENCE_ITEMS = 3;

export function createCoherenceIssues(
  coherence: {
    tldrMetricsMatch: boolean;
    tldrFeatureCoverage: boolean;
    personaCoverage: boolean;
    traceability: boolean;
    reasoning: string;
  },
  itemId: string
): Issue[] {
  const issues: Issue[] = [];

  if (!coherence.tldrMetricsMatch) {
    issues.push({
      id: "metric-inconsistency",
      itemId,
      severity: "error",
      message: "Metrics in TL;DR do not match Success Metrics.",
      evidence: coherence.reasoning,
    });
  }

  if (!coherence.tldrFeatureCoverage) {
    issues.push({
      id: "tldr-feature-mismatch",
      itemId,
      severity: "warn",
      message: "TL;DR does not adequately summarize core features.",
      evidence: coherence.reasoning,
    });
  }

  if (!coherence.personaCoverage) {
    issues.push({
      id: "missing-persona-coverage",
      itemId,
      severity: "error",
      message: "A required persona is missing from a key section.",
      evidence: coherence.reasoning,
    });
  }

  if (!coherence.traceability) {
    issues.push({
      id: "traceability-gap",
      itemId,
      severity: "error",
      message: "A Problem, Feature, or Metric is orphaned.",
      evidence: coherence.reasoning,
    });
  }

  return issues;
}

export function createQualityIssues(
  quality: {
    isExecutiveQuality: boolean;
    factualToneIssues: string[];
    metricIssues: string[];
    overExplanationIssues: string[];
    reasoning: string;
  },
  params: {
    enforceFactualTone: boolean;
    requireSpecificMetrics: boolean;
    banOverExplanation: boolean;
  },
  itemId: string
): Issue[] {
  const issues: Issue[] = [];

  if (!quality.isExecutiveQuality) {
    const evidence = [
      ...quality.factualToneIssues,
      ...quality.metricIssues,
      ...quality.overExplanationIssues,
    ]
      .slice(0, MAX_EVIDENCE_ITEMS)
      .join(", ");

    issues.push({
      id: "executive-quality-issue",
      itemId,
      severity: "warn",
      message: "AI detected vague language or non-specific metrics.",
      evidence,
    });
  }

  if (params.enforceFactualTone && quality.factualToneIssues.length > 0) {
    issues.push({
      id: "vague-or-hedging-language",
      itemId,
      severity: "warn",
      message: `AI detected vague/hedging language: ${quality.reasoning}`,
      evidence: quality.factualToneIssues
        .slice(0, MAX_EVIDENCE_ITEMS)
        .join(", "),
    });
  }

  if (params.requireSpecificMetrics && quality.metricIssues.length > 0) {
    issues.push({
      id: "metrics-not-specific",
      itemId,
      severity: "error",
      message: `AI detected non-specific metrics: ${quality.reasoning}`,
      evidence: quality.metricIssues.slice(0, MAX_EVIDENCE_ITEMS).join(", "),
    });
  }

  if (params.banOverExplanation && quality.overExplanationIssues.length > 0) {
    issues.push({
      id: "over-explanation",
      itemId,
      severity: "warn",
      message: `AI detected over-explanation/meta-commentary: ${quality.reasoning}`,
      evidence: quality.overExplanationIssues
        .slice(0, MAX_EVIDENCE_ITEMS)
        .join(", "),
    });
  }

  return issues;
}

export function createRealismIssues(
  realism: {
    isRealistic: boolean;
    unrealisticClaims: string[];
  },
  itemId: string
): Issue[] {
  const issues: Issue[] = [];

  if (!realism.isRealistic) {
    issues.push({
      id: "unrealistic-adoption",
      itemId,
      severity: "warn",
      message: "AI detected unrealistic adoption/migration claims.",
      evidence: realism.unrealisticClaims.join(", "),
    });
  }

  return issues;
}
