/**
 * Helper functions for refiner agent
 */

import type { Issue } from "@/lib/spec/types";

/**
 * Issue classification patterns for grouping
 */
const ISSUE_PATTERNS = {
  semantic: ["semantic", "quality"],
  structural: ["structure", "section"],
} as const;

/**
 * Group issues by type and build healing instructions
 */
export function buildHealingInstructions(issues: Issue[]): string {
  const groups = {
    deterministic: [] as Issue[],
    semantic: [] as Issue[],
    structural: [] as Issue[],
  };

  // Classify issues
  for (const issue of issues) {
    if (
      ISSUE_PATTERNS.semantic.some((pattern) => issue.itemId.includes(pattern))
    ) {
      groups.semantic.push(issue);
    } else if (
      ISSUE_PATTERNS.structural.some((pattern) =>
        issue.itemId.includes(pattern)
      )
    ) {
      groups.structural.push(issue);
    } else {
      groups.deterministic.push(issue);
    }
  }

  // Build sections
  const sections = [
    {
      title: "Deterministic Issues to Fix",
      issues: groups.deterministic,
      label: "Fix",
    },
    {
      title: "Semantic Issues to Fix",
      issues: groups.semantic,
      label: "Improvement",
    },
    {
      title: "Structural Issues to Fix",
      issues: groups.structural,
      label: "Required",
    },
  ];

  return sections
    .filter((section) => section.issues.length > 0)
    .map((section) =>
      buildIssueSection(section.title, section.issues, section.label)
    )
    .join("");
}

/**
 * Build a section of healing instructions for a specific issue type
 */
function buildIssueSection(
  title: string,
  issues: Issue[],
  hintLabel: string
): string {
  if (issues.length === 0) return "";

  const evidenceLabels = {
    Deterministic: "Evidence",
    Semantic: "Location",
    default: "Section",
  };
  const evidenceLabel =
    evidenceLabels[title.split(" ")[0] as keyof typeof evidenceLabels] ||
    evidenceLabels.default;

  let section = `## ${title}:\n`;

  for (const [index, issue] of issues.entries()) {
    section += `${index + 1}. **${issue.message}**\n`;

    if (issue.evidence?.trim() !== "") {
      section += `   - ${evidenceLabel}: ${issue.evidence}\n`;
    }

    if (issue.hints && issue.hints.length > 0) {
      section += `   - ${hintLabel}: ${issue.hints.join(", ")}\n`;
    }

    section += "\n";
  }

  return section;
}
