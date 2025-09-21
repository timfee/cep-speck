/**
 * Draft phase implementation
 */

import type { StreamTextResult } from "ai";

import {
  createGenerationFrame,
  createPhaseFrame,
  encodeStreamFrame,
} from "../../spec/streaming";

import { runDrafterAgent } from "../drafter";
import type { GenerationLoopContext } from "./types";

/**
 * Execute the draft generation phase
 */
export async function executeDraftPhase(
  context: GenerationLoopContext,
  attempt: number,
  totalTokens: number
): Promise<{ draft: string; updatedTokens: number }> {
  sendDraftPhaseNotification(context, attempt);
  const drafterResult = await runDrafterAgent(
    context.specText,
    context.pack,
    context.knowledgeContext,
    context.researchContext
  );
  return await streamDraftContent(context, drafterResult, totalTokens);
}

function sendDraftPhaseNotification(
  context: GenerationLoopContext,
  attempt: number
) {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "generating",
        attempt,
        `Drafting content (attempt ${attempt}/${context.maxAttempts})`
      )
    )
  );
}

async function streamDraftContent(
  context: GenerationLoopContext,
  drafterResult: StreamTextResult<Record<string, never>, never>,
  totalTokens: number
): Promise<{ draft: string; updatedTokens: number }> {
  let draftContent = "";
  let updatedTokens = totalTokens;

  for await (const delta of drafterResult.textStream) {
    draftContent += delta;
    context.safeEnqueue(
      encodeStreamFrame(
        createGenerationFrame(delta, draftContent, ++updatedTokens)
      )
    );
  }

  const draft = await drafterResult.text;
  return { draft, updatedTokens };
}
