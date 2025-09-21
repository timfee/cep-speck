/**
 * API route utilities for streaming workflow requests
 */

import { runGenerationLoop } from "@/lib/agents/hybridWorkflow";
import { DEFAULT_SPEC_PACK } from "@/lib/config";

import {
  loadKnowledgeBase,
  performResearch,
} from "@/lib/spec/api/workflowHelpers";

import { assertValidSpecPack } from "@/lib/spec/packValidate";

import {
  createErrorFrame,
  encodeStreamFrame,
  StreamingError,
} from "@/lib/spec/streaming";

// Constants for magic numbers
const MAX_ALLOWED_ATTEMPTS = 5;

// Use centralized spec pack configuration
// The pack is validated at runtime via assertValidSpecPack() to ensure type safety
const pack = DEFAULT_SPEC_PACK;

export interface RunRequestBody {
  specText: string;
  maxAttempts?: number;
}

export function isValidRunRequest(body: unknown): body is RunRequestBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "specText" in body &&
    typeof (body as RunRequestBody).specText === "string" &&
    ((body as RunRequestBody).maxAttempts === undefined ||
      typeof (body as RunRequestBody).maxAttempts === "number")
  );
}

export function createErrorResponse(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export function createStreamingResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}

export function calculateMaxAttempts(maxOverride?: number): number {
  return Math.min(
    maxOverride ?? pack.healPolicy.maxAttempts,
    MAX_ALLOWED_ATTEMPTS
  );
}

export function createStreamController(
  controller: ReadableStreamDefaultController
) {
  let controllerClosed = false;

  return {
    enqueue: (frame: Uint8Array) => {
      if (!controllerClosed) {
        controller.enqueue(frame);
      }
    },
    close: () => {
      if (!controllerClosed) {
        controller.close();
        controllerClosed = true;
      }
    },
  };
}

export function validateApiKey(
  streamController: ReturnType<typeof createStreamController>
): boolean {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if ((apiKey ?? "").length === 0) {
    const errorFrame = createErrorFrame(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY on server. Add it to .env.local and restart.",
      false,
      "MISSING_API_KEY"
    );
    streamController.enqueue(encodeStreamFrame(errorFrame));
    streamController.close();
    return false;
  }
  return true;
}

export function validateSpecPack(
  streamController: ReturnType<typeof createStreamController>
): boolean {
  try {
    assertValidSpecPack(pack);
    return true;
  } catch (error) {
    if (error instanceof StreamingError) {
      streamController.enqueue(encodeStreamFrame(error.toStreamFrame()));
      streamController.close();
      return false;
    }
    throw error;
  }
}

export async function prepareWorkflowContext({
  specText,
  maxAttempts,
  startTime,
  streamController,
}: {
  specText: string;
  maxAttempts: number;
  startTime: number;
  streamController: ReturnType<typeof createStreamController>;
}) {
  const workflowContext = {
    specText,
    pack,
    maxAttempts,
    startTime,
    safeEnqueue: streamController.enqueue,
  };

  const knowledgeContext = await loadKnowledgeBase(workflowContext);
  const researchContext = performResearch(workflowContext);

  return { knowledgeContext, researchContext };
}

export async function executeHybridWorkflow({
  specText,
  maxAttempts,
  startTime,
  streamController,
}: {
  specText: string;
  maxAttempts: number;
  startTime: number;
  streamController: ReturnType<typeof createStreamController>;
}) {
  const { knowledgeContext, researchContext } = await prepareWorkflowContext({
    specText,
    maxAttempts,
    startTime,
    streamController,
  });

  await runGenerationLoop({
    specText,
    knowledgeContext,
    researchContext,
    pack,
    maxAttempts,
    startTime,
    safeEnqueue: streamController.enqueue,
  });
}

export function handleStreamError(
  e: unknown,
  streamController: ReturnType<typeof createStreamController>
) {
  const error =
    e instanceof StreamingError
      ? e
      : new StreamingError(
          e instanceof Error ? e.message : String(e),
          false,
          "UNEXPECTED_ERROR",
          e
        );

  streamController.enqueue(encodeStreamFrame(error.toStreamFrame()));
  streamController.close();
}
