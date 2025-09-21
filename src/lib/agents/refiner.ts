/**
 * Refiner Agent - AI-powered document healing replacement
 *
 * Intelligently fixes both deterministic validation issues and semantic
 * quality problems to produce publication-ready PRDs.
 */

import type { StreamTextResult } from "ai";

import { getResilientAI } from "@/lib/ai/resilient";
import type { Issue } from "@/lib/spec/types";

import { loadPrompt } from "./prompt-loader";

/**
 * Configuration for the refiner agent
 */
export interface RefinerConfig {
  /** Whether to include original content preservation instructions */
  preserveOriginal?: boolean;
  /** Maximum number of refinement iterations */
  maxIterations?: number;
  /** Whether to focus on specific issue types */
  focusAreas?: ("deterministic" | "semantic" | "quality")[];
}

/**
 * Result of refiner operation
 */
export interface RefinerResult {
  /** The refined document content */
  content: string;
  /** Number of issues addressed */
  issuesFixed: number;
  /** Processing metadata */
  metadata: {
    /** Duration in milliseconds */
    duration: number;
    /** Agent identifier */
    agentId: string;
    /** Issues that were addressed */
    addressedIssues: string[];
  };
}

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
function buildHealingInstructions(issues: Issue[]): string {
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

/**
 * Run the refiner agent to fix document issues
 *
 * @param draft - The original PRD draft content
 * @param allIssues - Combined array of deterministic and semantic issues
 * @param config - Optional configuration for refinement behavior
 * @returns Promise resolving to streaming text result with refined content
 *
 * @example
 * ```typescript
 * const result = await runRefinerAgent(draft, issues);
 * for await (const chunk of result.textStream) {
 *   console.log(chunk);
 * }
 * ```
 */
export async function runRefinerAgent(
  draft: string,
  allIssues: Issue[],
  _config: RefinerConfig = {}
): Promise<StreamTextResult<Record<string, never>, never>> {
  try {
    // Load the refiner prompt guide
    const refinerPrompt = await loadPrompt({
      path: "guides/prompts/refiner.md",
      cache: true,
      fallback:
        "Fix all validation issues in this PRD while maintaining quality and coherence.",
    });

    // Build healing instructions from issues
    const healingInstructions = buildHealingInstructions(allIssues);

    // Build comprehensive refinement prompt
    const refinementPrompt = `${refinerPrompt}

## Issues to Address

${healingInstructions}

## Original Document

${draft}

## Instructions

Fix all the issues listed above while maintaining the document's core message and professional quality. Provide the complete, corrected PRD as your response. Ensure:

1. All deterministic validation errors are resolved
2. Semantic quality issues are improved
3. Document coherence is maintained
4. Executive readiness is enhanced
5. Original content value is preserved

Return only the corrected document content without additional commentary.`;

    // Get resilient AI instance
    const resilientAI = getResilientAI();

    // Generate refined content with streaming
    const result = await resilientAI.generateWithFallback([
      {
        role: "system",
        content:
          "You are an expert technical writer specializing in Chrome Enterprise Premium PRDs. Fix all issues while maintaining document quality and coherence.",
      },
      {
        role: "user",
        content: refinementPrompt,
      },
    ]);

    return result;
  } catch (error) {
    console.error("Refiner agent failed:", error);

    // Re-throw with context for upstream error handling
    throw new Error(
      `Refiner agent failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Run refiner agent and collect the complete result
 *
 * @param draft - The original PRD draft content
 * @param allIssues - Combined array of deterministic and semantic issues
 * @param config - Optional configuration for refinement behavior
 * @returns Promise resolving to complete refiner result
 *
 * @example
 * ```typescript
 * const result = await runRefinerAgentComplete(draft, issues);
 * console.log(`Fixed ${result.issuesFixed} issues in ${result.metadata.duration}ms`);
 * ```
 */
export async function runRefinerAgentComplete(
  draft: string,
  allIssues: Issue[],
  _config: RefinerConfig = {}
): Promise<RefinerResult> {
  const startTime = Date.now();

  try {
    const streamResult = await runRefinerAgent(draft, allIssues, _config);

    // Collect all content from the stream
    let refinedContent = "";
    for await (const chunk of streamResult.textStream) {
      refinedContent += chunk;
    }

    const duration = Date.now() - startTime;

    return {
      content: refinedContent,
      issuesFixed: allIssues.length,
      metadata: {
        duration,
        agentId: "refiner",
        addressedIssues: allIssues.map((issue) => issue.id),
      },
    };
  } catch (error) {
    console.error("Refiner agent complete failed:", error);
    throw error;
  }
}
