/**
 * Streaming response utilities for API route
 */

import { encodeStreamFrame, StreamingError } from "@/lib/spec/streaming";

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
