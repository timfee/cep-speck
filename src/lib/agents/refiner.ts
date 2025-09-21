/**
 * Refiner Agent - AI-powered document healing replacement
 *
 * Intelligently fixes both deterministic validation issues and semantic
 * quality problems to produce publication-ready PRDs.
 */

import type { StreamTextResult } from "ai";

import { getResilientAI } from "@/lib/ai/resilient";
import type { Issue } from "@/lib/spec/types";

import type { RefinerConfig, RefinerResult } from "./agent-types";
import { loadPrompt } from "./prompt-loader";
import { buildHealingInstructions } from "./refiner-helpers";

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
    const refinerPrompt = await loadPrompt({
      path: "guides/prompts/refiner.md",
      cache: true,
      fallback:
        "Fix all validation issues in this PRD while maintaining quality and coherence.",
    });

    const healingInstructions = buildHealingInstructions(allIssues);

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

    const resilientAI = getResilientAI();
    return await resilientAI.generateWithFallback([
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
  } catch (error) {
    console.error("Refiner agent failed:", error);
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
