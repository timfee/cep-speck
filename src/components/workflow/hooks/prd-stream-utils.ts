import type { Issue, StreamFrame } from "@/lib/spec/types";

export interface FrameCallbacks {
  onPhase: (frame: StreamFrame & { type: "phase" }) => void;
  onGeneration: (frame: StreamFrame & { type: "generation" }) => void;
  onResult: (frame: StreamFrame & { type: "result" }) => void;
  onValidation: (frame: StreamFrame & { type: "validation" }) => void;
  onSelfReview: (frame: StreamFrame & { type: "self-review" }) => void;
  onError: (frame: StreamFrame & { type: "error" }) => void;
}

export type StreamFrameHandler = (frame: StreamFrame) => void;

function assertNever(_value: never, message: string): never {
  throw new Error(message);
}

interface GenerationCallbackHandlers {
  onPhase: (phase: string, attempt?: number) => void;
  onGeneration: (delta: string) => void;
  onResult: (finalDraft: string) => void;
  onValidation: (issues: Issue[]) => void;
  onError: (message: string) => never;
  onSelfReview?: () => void;
}

export function createFrameHandler(
  callbacks: FrameCallbacks
): StreamFrameHandler {
  return (frame: StreamFrame) => {
    switch (frame.type) {
      case "phase":
        callbacks.onPhase(frame);
        return;
      case "generation":
        if (frame.data.delta === "") {
          return;
        }
        callbacks.onGeneration(frame);
        return;
      case "result":
        callbacks.onResult(frame);
        return;
      case "validation":
        callbacks.onValidation(frame);
        return;
      case "self-review":
        callbacks.onSelfReview(frame);
        return;
      case "error":
        callbacks.onError(frame);
        return;
    }

    assertNever(
      frame,
      `Unhandled stream frame type: ${(frame as { type: string }).type}`
    );
  };
}

export async function consumeStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  processor: { processChunk(chunk: Uint8Array): StreamFrame[] },
  handleFrame: StreamFrameHandler
): Promise<void> {
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const frames = processor.processChunk(value);
    for (const frame of frames) {
      handleFrame(frame);
    }
  }
}

export function mapValidationIssues(
  frame: StreamFrame & { type: "validation" }
): Issue[] {
  return frame.data.report.ok ? [] : frame.data.report.issues;
}

export function createGenerationCallbacks(
  handlers: GenerationCallbackHandlers
): FrameCallbacks {
  return {
    onPhase: (frame) => handlers.onPhase(frame.data.phase, frame.data.attempt),
    onGeneration: (frame) => handlers.onGeneration(frame.data.delta),
    onResult: (frame) => handlers.onResult(frame.data.finalDraft),
    onValidation: (frame) => handlers.onValidation(mapValidationIssues(frame)),
    onSelfReview: () => handlers.onSelfReview?.(),
    onError: (frame) => handlers.onError(frame.data.message),
  };
}
