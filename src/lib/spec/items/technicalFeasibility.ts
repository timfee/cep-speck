import type { Issue } from "../types";

export const itemId = "technical-feasibility";
export type Params = Record<string, never>;

function toPrompt(_params: Params, _pack?: unknown): string {
  return "Reject impossible percentages (>100%) and absolute claims (100%).";
}

async function validate(draft: string, _params: Params, _pack?: unknown): Promise<Issue[]> {
  const issues: Issue[] = [];

  // Check for impossible percentages (>100%)
  const percentagePattern = /(\d+(?:\.\d+)?)\s*%/g;
  let match: RegExpExecArray | null;

  while ((match = percentagePattern.exec(draft)) !== null) {
    const value = parseFloat(match[1]);
    if (value > 100) {
      issues.push({
        id: "impossible-percentage",
        itemId,
        severity: "error", // This is a hard failure
        message: `Impossible percentage: ${value}%`,
        evidence: match[0],
      });
    } else if (value === 100) {
      issues.push({
        id: "absolute-percentage",
        itemId,
        severity: "warn", // This is a warning
        message: "Avoid claiming 100% outcomes for human behavior (e.g., adoption, compliance).",
        evidence: match[0],
      });
    }
  }
  return issues;
}

async function heal(
  _issues: Issue[],
  _params: Params,
  _pack?: unknown
): Promise<string | null> {
  if (!_issues.length) return null;
  return `Review all percentage claims. Replace any >100% value with a realistic figure. Rephrase any 100% claim (e.g., "100% adoption") to a more defensible range (e.g., "99.9% coverage" or "95% adoption").`;
}

export const itemModule = { itemId, toPrompt, validate, heal };
