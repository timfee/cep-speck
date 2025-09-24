import { StreamProcessor } from "@/lib/spec/helpers/streaming";

import type {
  SerializedWorkflowOutline,
  SerializedWorkflowSpec,
} from "@/types/workflow";

import type { StreamFrameHandler } from "./prd-stream-utils";
import { consumeStream } from "./prd-stream-utils";

interface GenerationRequestOptions {
  maxAttempts?: number;
}

const DEFAULT_MAX_ATTEMPTS = 3;

interface GenerationRequestPayload {
  structuredSpec: SerializedWorkflowSpec;
  outlinePayload: SerializedWorkflowOutline;
  legacySpecText: string;
}

export async function runGenerationRequest(
  payload: GenerationRequestPayload,
  frameHandler: StreamFrameHandler,
  options: GenerationRequestOptions = {}
): Promise<void> {
  const response = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      specText: payload.legacySpecText,
      structuredSpec: payload.structuredSpec,
      outlinePayload: payload.outlinePayload,
      maxAttempts: options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    }),
  });

  if (!response.ok) {
    throw new Error(`Generation failed: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("Generation failed: empty response body");
  }

  const processor = new StreamProcessor();
  const reader = response.body.getReader();

  await consumeStream(reader, processor, frameHandler);

  const finalFrames = processor.flush();
  for (const frame of finalFrames) {
    frameHandler(frame);
  }
}
