/**
 * Refinement phase implementation
 */

import type { StreamTextResult } from "ai";

import type { GenerationLoopContext } from "./types";

import {
  createGenerationFrame,
  createPhaseFrame,
  encodeStreamFrame,
} from "../../spec/streaming";

import type { Issue } from "../../spec/types";
import { runRefinerAgent } from "../refiner";

/**
 * Run refinement phase
 */
export async function runRefinement(
  context: GenerationLoopContext,
  attempt: number,
  draft: string,
  allIssues: Issue[],
  totalTokens: number
): Promise<{ draft: string; updatedTokens: number }> {
  sendRefinementPhaseNotification(context, attempt, allIssues);
  const refinerResult = await runRefinerAgent(draft, allIssues);
  return await streamRefinedContent(context, refinerResult, totalTokens);
}

function sendRefinementPhaseNotification(
  context: GenerationLoopContext,
  attempt: number,
  allIssues: Issue[]
) {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "healing",
        attempt,
        `Refining content (${allIssues.length} issues found)`
      )
    )
  );
}

async function streamRefinedContent(
  context: GenerationLoopContext,
  refinerResult: StreamTextResult<Record<string, never>, never>,
  totalTokens: number
): Promise<{ draft: string; updatedTokens: number }> {
  let refinedContent = "";
  let updatedTokens = totalTokens;

  for await (const delta of refinerResult.textStream) {
    refinedContent += delta;
    context.safeEnqueue(
      encodeStreamFrame(
        createGenerationFrame(delta, refinedContent, ++updatedTokens)
      )
    );
  }

  const draft = await refinerResult.text;
  return { draft, updatedTokens };
}
