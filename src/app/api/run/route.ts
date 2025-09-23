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
  pack,
  type RunRequestBody,
  validateApiKey,
  validateSpecPack,
} from "./utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const requestBody: unknown = await req.json();

  if (!isValidRunRequest(requestBody)) {
    return createErrorResponse("Invalid request body");
  }

  const {
    specText,
    structuredSpec,
    outlinePayload,
    maxAttempts: maxOverride,
  } = requestBody;
  const maxAttempts = calculateMaxAttempts(maxOverride);

  const stream = createHybridWorkflowStream({
    specText,
    structuredSpec,
    outlinePayload,
    maxAttempts,
    startTime: Date.now(),
  });

  return createStreamingResponse(stream);
}

function createHybridWorkflowStream({
  specText,
  structuredSpec,
  outlinePayload,
  maxAttempts,
  startTime,
}: {
  specText: string;
  structuredSpec?: RunRequestBody["structuredSpec"];
  outlinePayload?: RunRequestBody["outlinePayload"];
  maxAttempts: number;
  startTime: number;
}) {
  return new ReadableStream({
    async start(controller) {
      const streamController = createStreamController(controller);
      await processWorkflowRequest(streamController, {
        specText,
        structuredSpec,
        outlinePayload,
        maxAttempts,
        startTime,
      });
    },
  });
}

async function processWorkflowRequest(
  streamController: ReturnType<typeof createStreamController>,
  params: {
    specText: string;
    structuredSpec?: RunRequestBody["structuredSpec"];
    outlinePayload?: RunRequestBody["outlinePayload"];
    maxAttempts: number;
    startTime: number;
  }
) {
  try {
    if (!validateApiKey(streamController)) return;
    if (!validateSpecPack(pack, streamController)) return;

    await executeHybridWorkflow({ ...params, streamController });

    streamController.close();
  } catch (e: unknown) {
    handleStreamError(e, streamController);
  }
}
