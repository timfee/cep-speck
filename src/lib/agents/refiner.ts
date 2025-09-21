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
 * Group issues by type for targeted healing instructions
 */
function groupIssuesByType(issues: Issue[]): {
  deterministic: Issue[];
  semantic: Issue[];
  structural: Issue[];
} {
  const groups = {
    deterministic: [] as Issue[],
    semantic: [] as Issue[],
    structural: [] as Issue[],
  };

  for (const issue of issues) {
    // Classify issues based on itemId patterns
    if (issue.itemId.includes("semantic") || issue.itemId.includes("quality")) {
      groups.semantic.push(issue);
    } else if (
      issue.itemId.includes("structure") ||
      issue.itemId.includes("section")
    ) {
      groups.structural.push(issue);
    } else {
      groups.deterministic.push(issue);
    }
  }

  return groups;
}

/**
 * Build specific healing instructions for different issue types
 */
function buildHealingInstructions(groupedIssues: {
  deterministic: Issue[];
  semantic: Issue[];
  structural: Issue[];
}): string {
  let instructions = "";

  instructions += buildIssueSection(
    "Deterministic Issues to Fix",
    groupedIssues.deterministic,
    "Fix"
  );
  instructions += buildIssueSection(
    "Semantic Issues to Fix",
    groupedIssues.semantic,
    "Improvement"
  );
  instructions += buildIssueSection(
    "Structural Issues to Fix",
    groupedIssues.structural,
    "Required"
  );

  return instructions;
}

/**
 * Build a section of healing instructions for a specific issue type
 */
function buildIssueSection(
  title: string,
  issues: Issue[],
  hintLabel: string
): string {
  if (issues.length === 0) {
    return "";
  }

  let section = `## ${title}:\n`;

  for (const [index, issue] of issues.entries()) {
    section += `${index + 1}. **${issue.message}**\n`;

    if (issue.evidence?.trim() !== "") {
      const evidenceLabel = title.includes("Deterministic")
        ? "Evidence"
        : title.includes("Semantic")
          ? "Location"
          : "Section";
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

    // Group issues by type for targeted instructions
    const groupedIssues = groupIssuesByType(allIssues);
    const healingInstructions = buildHealingInstructions(groupedIssues);

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
