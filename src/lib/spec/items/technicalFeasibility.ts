import type { Issue } from "../types";

export const itemId = "technical-feasibility";
// No Params type required

export function toPrompt(): string {
  return "Reject impossible percentages (>100%) and flag unrealistic rapid adoption claims.";
}

export function validate(draft: string): Issue[] {
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
        severity: "error",
        message: `Impossible percentage: ${value}%`,
        evidence: match[0],
      });
    } else if (value === 100) {
      issues.push({
        id: "absolute-percentage",
        itemId,
        severity: "warn",
        message: "Avoid claiming 100% outcomes for human behavior",
        evidence: match[0],
      });
    }
  }

  // Check for unrealistic adoption claims using multiple flexible patterns
  const adoptionPatterns = [
    // Pattern 1: percentage first, then timeline (e.g., "85% adoption within 14 days")
    /(\d+)\s*%.*?(adoption|activation|migration).*?(within|in)\s+(\d+)\s*(day|week|month)/gi,
    // Pattern 2: timeline first, then percentage (e.g., "within 14 days, 85% adoption")
    /(within|in)\s+(\d+)\s*(day|week|month).*?(\d+)\s*%.*?(adoption|activation|migration)/gi,
  ];

  for (const pattern of adoptionPatterns) {
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0; // Reset regex state

    while ((match = pattern.exec(draft)) !== null) {
      const claim = match[0];

      // Parse percentage and time values based on their position and context
      // Extract percentage (number followed by %)
      const percentageMatch = claim.match(/(\d+)\s*%/);
      if (!percentageMatch) continue;
      const percentageValue = parseInt(percentageMatch[1], 10);

      // Extract time value and unit
      const timeMatch = claim.match(/(within|in)\s+(\d+)\s*(day|week|month)/i);
      if (!timeMatch) continue;
      const timeValue = parseInt(timeMatch[2], 10);
      const timeUnit = timeMatch[3].toLowerCase();

      // Convert time to days for comparison
      let timeInDays = timeValue;
      if (timeUnit.startsWith("week")) {
        timeInDays = timeValue * 7;
      } else if (timeUnit.startsWith("month")) {
        timeInDays = timeValue * 30;
      }

      if (percentageValue > 80 && timeInDays < 30) {
        issues.push({
          id: "unrealistic-adoption",
          itemId,
          severity: "warn",
          message: "Potentially unrealistic adoption timeline",
          evidence: claim,
        });
      }
    }
  }

  return issues;
}

export function heal(): string | null {
  return `Adjust feasibility claims:
1. Replace any >100% value with a realistic capped figure or rephrase qualitatively.
2. Avoid 100% adoption/coverage; use a defensible range (e.g., 85–90%).
3. For rapid adoption timelines (>80% in <30 days), either lower % or extend timeframe with rationale (baseline install base, enforced deployment mechanism, auto-updates, etc.).`;
}
