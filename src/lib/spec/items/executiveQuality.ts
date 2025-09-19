import { PATTERNS, createHealingBuilder, HEALING_TEMPLATES, voidUnused, createWordBoundaryRegex } from "../helpers";

import type { Issue } from "../types";

export const itemId = "executive-quality";
export type Params = {
  enforceFactualTone: boolean;
  requireSpecificMetrics: boolean;
  banOverExplanation: boolean;
};

// Constants for quality thresholds
const MAX_VAGUE_QUANTIFIERS = 3;
const MAX_OVER_EXPLANATION_INSTANCES = 5;

function toPrompt(_params: Params, _pack?: unknown): string {
  voidUnused(_params, _pack);
  return `Write with executive precision: factual statements, specific metrics with units and timeframes, direct language without over-explanation. Avoid sensationalist claims, empty business speak, or cutesy headings. Each statement should add concrete value.`;
}

function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  voidUnused(_pack);
  const issues: Issue[] = [];

  if (params.enforceFactualTone) {
    const vagueQuantifiers = draft.match(PATTERNS.VAGUE_QUANTIFIERS);
    if (vagueQuantifiers && vagueQuantifiers.length > MAX_VAGUE_QUANTIFIERS) {
      issues.push({
        id: "vague-quantifiers",
        itemId,
        severity: "warn",
        message:
          "Too many vague quantifiers - use specific numbers where possible",
        evidence: `Found ${
          vagueQuantifiers.length
        } instances: ${vagueQuantifiers.slice(0, MAX_VAGUE_QUANTIFIERS).join(", ")}...`,
      });
    }

    const hedgingLanguage = draft.match(PATTERNS.HEDGING_LANGUAGE);
    if (hedgingLanguage && hedgingLanguage.length > MAX_OVER_EXPLANATION_INSTANCES) {
      issues.push({
        id: "excessive-hedging",
        itemId,
        severity: "warn",
        message: "Excessive hedging language - state facts directly when known",
        evidence: `Found ${hedgingLanguage.length} instances`,
      });
    }

    const qualityTheaterTerms = ["NPS", "Net Promoter Score", "satisfaction score", "happiness index", "engagement score"];
    const inventedMetrics = qualityTheaterTerms.filter(term => {
      const regex = createWordBoundaryRegex(term, 'gi');
      return regex.test(draft);
    });
    if (inventedMetrics.length > 0) {
      issues.push({
        id: "quality-theater-metrics",
        itemId,
        severity: "warn",
        message:
          "Avoid quality theater metrics like NPS - focus on operational metrics",
        evidence: `Quality indicators found: ${inventedMetrics.join(", ")}`,
      });
    }

    const businessSpeakTerms = ["solidify our future", "strengthen our position", "position ourselves", "future-proof"];
    const solidifyFuture = businessSpeakTerms.filter(term => {
      const regex = createWordBoundaryRegex(term, 'gi');
      return regex.test(draft);
    });
    if (solidifyFuture.length > 0) {
      issues.push({
        id: "empty-business-speak",
        itemId,
        severity: "error",
        message: "Empty business speak detected - state concrete outcomes",
        evidence: `Business speak found: ${solidifyFuture.join(", ")}`,
      });
    }
  }

  if (params.requireSpecificMetrics) {
    const metricSections = draft.match(
      /# \d+\. Success Metrics[\s\S]*?(?=# \d+\.|$)/i
    );
    if (metricSections) {
      const metricsContent = metricSections[0];
      // Complex regex for numbers without units - not suitable for helper
      const numbersWithoutUnits = metricsContent.match(
        // eslint-disable-next-line custom/enforce-helper-usage
        /\b\d+(?!\s*(?:%|ms|s|sec|seconds|minutes|hours|days|weeks|months|years|qps|rps|rpm|req\/s|MB|GB|TB|requests|users|tenants|releases))\b/g
      );
      if (numbersWithoutUnits && numbersWithoutUnits.length > 2) {
        issues.push({
          id: "metrics-missing-units",
          itemId,
          severity: "error",
          message: "Metrics section contains numbers without units",
          evidence: `Numbers without units: ${numbersWithoutUnits.join(", ")}`,
        });
      }

      // Complex regex for heuristic masking - not suitable for simple word boundary helper
      const heuristicMasking = draft.match(
        // eslint-disable-next-line custom/enforce-helper-usage
        /\b(because|due to|in order to|to ensure|for the purpose of)\s+[^.]*\b(metric|measure|track|monitor)\b/gi
      );
      if (heuristicMasking && heuristicMasking.length > 0) {
        issues.push({
          id: "heuristic-masking",
          itemId,
          severity: "warn",
          message:
            "Consider stating the heuristic directly rather than obscuring through metrics",
          evidence: `Potential heuristic masking: ${heuristicMasking
            .slice(0, 2)
            .join("; ")}`,
        });
      }
    }
  }

  if (params.banOverExplanation) {
    for (const pattern of PATTERNS.OVER_EXPLANATION) {
      const matches = draft.match(pattern);
      if (matches && matches.length > 2) {
        issues.push({
          id: "over-explanation",
          itemId,
          severity: "warn",
          message: "Remove explanatory phrases - state facts directly",
          evidence: `Over-explanation detected: ${matches.slice(0, 2).join(", ")}`,
        });
      }
    }
  }

  return issues;
}

function heal(
  issues: Issue[],
  _params: Params,
  _pack?: unknown
): string | null {
  voidUnused(_params, _pack);
  if (!issues.length) return null;

  return createHealingBuilder()
    .addForIssue(issues, "vague-quantifiers", HEALING_TEMPLATES.METRIC_SPECIFICITY)
    .addForIssue(issues, "excessive-hedging", HEALING_TEMPLATES.REDUCE_HEDGING)
    .addForIssue(issues, "metrics-missing-units", HEALING_TEMPLATES.METRIC_UNITS)
    .addForIssue(issues, "over-explanation", HEALING_TEMPLATES.REMOVE_META_COMMENTARY)
    .build(HEALING_TEMPLATES.EXECUTIVE_PRECISION);
}

export const itemModule = { itemId, toPrompt, validate, heal };