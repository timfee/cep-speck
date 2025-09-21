/**
 * Workflow error handling utilities
 */

import type { GenerationLoopContext } from "./types";

import {
  createPhaseFrame,
  createResultFrame,
  encodeStreamFrame,
} from "../../spec/streaming";

/**
 * Handle workflow errors gracefully
 */
export function handleWorkflowError(
  context: GenerationLoopContext,
  attempt: number,
  finalDraft: string,
  error: unknown
) {
  const totalDuration = Date.now() - context.startTime;
  const errorMessage = error instanceof Error ? error.message : String(error);

  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("failed", attempt, `Workflow error: ${errorMessage}`)
    )
  );
  context.safeEnqueue(
    encodeStreamFrame(
      createResultFrame(false, finalDraft || "", attempt, totalDuration)
    )
  );
}
