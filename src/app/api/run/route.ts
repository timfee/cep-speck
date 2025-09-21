import type { NextRequest } from "next/server";

import "@/lib/spec/items";

import {
  calculateMaxAttempts,
  createErrorResponse,
  createStreamController,
  createStreamingResponse,
  executeHybridWorkflow,
  handleStreamError,
  isValidRunRequest,
  validateApiKey,
  validateSpecPack,
} from "./utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const requestBody: unknown = await req.json();

  if (!isValidRunRequest(requestBody)) {
    return createErrorResponse("Invalid request body");
  }

  const { specText, maxAttempts: maxOverride } = requestBody;
  const maxAttempts = calculateMaxAttempts(maxOverride);

  const stream = createHybridWorkflowStream({
    specText,
    maxAttempts,
    startTime: Date.now(),
  });

  return createStreamingResponse(stream);
}

function createHybridWorkflowStream({
  specText,
  maxAttempts,
  startTime,
}: {
  specText: string;
  maxAttempts: number;
  startTime: number;
}) {
  return new ReadableStream({
    async start(controller) {
      const streamController = createStreamController(controller);
      await processWorkflowRequest(streamController, {
        specText,
        maxAttempts,
        startTime,
      });
    },
  });
}

async function processWorkflowRequest(
  streamController: ReturnType<typeof createStreamController>,
  params: { specText: string; maxAttempts: number; startTime: number }
) {
  try {
    if (!validateApiKey(streamController)) return;
    if (!validateSpecPack(streamController)) return;

    await executeHybridWorkflow({
      ...params,
      streamController,
    });

    streamController.close();
  } catch (e: unknown) {
    handleStreamError(e, streamController);
  }
}
