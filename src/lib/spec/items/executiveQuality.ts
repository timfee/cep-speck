import type { Issue } from "../types";

export const itemId = "executive-quality";
export type Params = {
  enforceFactualTone: boolean;
  requireSpecificMetrics: boolean;
  banOverExplanation: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toPrompt(_params: Params, _pack?: unknown): string {
  return `Write with executive precision: factual statements, specific metrics with units and timeframes, direct language without over-explanation. Avoid sensationalist claims, empty business speak, or cutesy headings. Each statement should add concrete value.`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validate(draft: string, params: Params, _pack?: unknown): Issue[] {
  const issues: Issue[] = [];

  if (params.enforceFactualTone) {
    const vagueQuantifiers = draft.match(
      /\b(many|several|numerous|various|multiple|some|most|few)\s+(?!days|weeks|months|years|minutes|seconds|hours)\w+/gi
    );
    if (vagueQuantifiers && vagueQuantifiers.length > 3) {
      issues.push({
        id: "vague-quantifiers",
        itemId,
        severity: "warn",
        message:
          "Too many vague quantifiers - use specific numbers where possible",
        evidence: `Found ${
          vagueQuantifiers.length
        } instances: ${vagueQuantifiers.slice(0, 3).join(", ")}...`,
      });
    }

    const hedgingLanguage = draft.match(
      /\b(potentially|possibly|might|could|may|perhaps|likely|probably)\s+\w+/gi
    );
    if (hedgingLanguage && hedgingLanguage.length > 5) {
      issues.push({
        id: "excessive-hedging",
        itemId,
        severity: "warn",
        message: "Excessive hedging language - state facts directly when known",
        evidence: `Found ${hedgingLanguage.length} instances`,
      });
    }

    const inventedMetrics = draft.match(
      /\b(NPS|Net Promoter Score|satisfaction score|happiness index|engagement score)\b/gi
    );
    if (inventedMetrics && inventedMetrics.length > 0) {
      issues.push({
        id: "quality-theater-metrics",
        itemId,
        severity: "warn",
        message:
          "Avoid quality theater metrics like NPS - focus on operational metrics",
        evidence: `Quality indicators found: ${inventedMetrics.join(", ")}`,
      });
    }

    const solidifyFuture = draft.match(
      /\b(solidify our future|strengthen our position|position ourselves|future-proof)\b/gi
    );
    if (solidifyFuture && solidifyFuture.length > 0) {
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
      const numbersWithoutUnits = metricsContent.match(
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

      const heuristicMasking = draft.match(
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
    const overExplanationPatterns = [
      /\b(as mentioned|as stated|as discussed|as noted|it should be noted|it is important to note|it is worth noting)\b/gi,
      /\b(in other words|to put it simply|simply put|to clarify|to elaborate)\b/gi,
      /\b(this means that|what this means is|the implication is|this implies)\b/gi,
    ];

    for (const pattern of overExplanationPatterns) {
      const matches = draft.match(pattern);
      if (matches && matches.length > 2) {
        issues.push({
          id: "over-explanation",
          itemId,
          severity: "warn",
          message:
            "Over-explanation detected - state facts directly without meta-commentary",
          evidence: `Found ${matches.length} instances: ${matches
            .slice(0, 2)
            .join(", ")}`,
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
  if (!issues.length) return null;

  const healingInstructions: string[] = [];

  if (issues.some((i) => i.id === "vague-quantifiers")) {
    healingInstructions.push(
      "Replace vague quantifiers with specific numbers, percentages, or ranges"
    );
  }

  if (issues.some((i) => i.id === "excessive-hedging")) {
    healingInstructions.push(
      "State facts directly; use hedging only for genuine uncertainty"
    );
  }

  if (issues.some((i) => i.id === "metrics-missing-units")) {
    healingInstructions.push(
      "Add units and timeframes to all metrics (%, ms, minutes, # users, etc.)"
    );
  }

  if (issues.some((i) => i.id === "over-explanation")) {
    healingInstructions.push(
      "Remove meta-commentary and explanatory phrases; state facts directly"
    );
  }

  return healingInstructions.length > 0
    ? `Enhance executive precision: ${healingInstructions.join("; ")}.`
    : null;
}

export const itemModule = { itemId, toPrompt, validate, heal };
