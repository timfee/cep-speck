import type { StreamTextResult } from "ai";

import { getResilientAI } from "@/lib/ai/resilient";
import { formatOutlineEnumerationsForPrompt } from "@/lib/spec/helpers/outline-enumerations";
import type { Issue } from "@/lib/spec/types";

import type { RefinerConfig, RefinerResult } from "./agent-types";
import { loadPrompt } from "./prompt-loader";
import { buildHealingInstructions } from "./refiner-helpers";
import { buildRefinerPrompt } from "./refiner-prompts";

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

    const refinementPrompt = buildRefinerPrompt({
      basePrompt: refinerPrompt,
      enumerationSummary: formatOutlineEnumerationsForPrompt(),
      healingInstructions: buildHealingInstructions(allIssues),
      draft,
    });

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
