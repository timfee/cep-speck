/**
 * Workflow completion and notification utilities
 */

import type { GenerationLoopContext } from "./types";

import {
  createPhaseFrame,
  createResultFrame,
  encodeStreamFrame,
} from "../../spec/streaming";

import type { Issue } from "../../spec/types";

/**
 * Finish workflow successfully
 */
export function finishSuccessfully(
  context: GenerationLoopContext,
  attempt: number,
  draft: string
) {
  const totalDuration = Date.now() - context.startTime;

  sendSuccessNotification(context, attempt);
  sendSuccessResult(context, draft, attempt, totalDuration);
}

/**
 * Finish workflow with failure
 */
export function finishWithFailure(
  context: GenerationLoopContext,
  attempt: number,
  draft: string,
  allIssues: Issue[]
) {
  const totalDuration = Date.now() - context.startTime;

  sendFailureNotification(context, attempt, allIssues);
  sendFailureResult(context, draft, attempt, totalDuration);
}

function sendSuccessNotification(
  context: GenerationLoopContext,
  attempt: number
) {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("done", attempt, "Content generation complete")
    )
  );
}

function sendSuccessResult(
  context: GenerationLoopContext,
  draft: string,
  attempt: number,
  totalDuration: number
) {
  context.safeEnqueue(
    encodeStreamFrame(createResultFrame(true, draft, attempt, totalDuration))
  );
}

function sendFailureNotification(
  context: GenerationLoopContext,
  attempt: number,
  allIssues: Issue[]
) {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "failed",
        attempt,
        `Validation failed with ${allIssues.length} issues`
      )
    )
  );
}

function sendFailureResult(
  context: GenerationLoopContext,
  draft: string,
  attempt: number,
  totalDuration: number
) {
  context.safeEnqueue(
    encodeStreamFrame(createResultFrame(false, draft, attempt, totalDuration))
  );
}
