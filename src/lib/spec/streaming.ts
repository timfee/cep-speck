import type { StreamFrame, StreamPhase, ValidationReport } from "./types";

/**
 * Utility functions for structured streaming protocol
 */

export function createStreamFrame<T extends StreamFrame["type"]>(
  type: T,
  data: Extract<StreamFrame, { type: T }>["data"]
): StreamFrame {
  return { type, data } as StreamFrame;
}

export function encodeStreamFrame(frame: StreamFrame): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(frame) + "\n");
}

export function createPhaseFrame(
  phase: StreamPhase,
  attempt: number,
  message?: string
): StreamFrame {
  return createStreamFrame("phase", {
    phase,
    attempt,
    timestamp: Date.now(),
    message,
  });
}

export function createGenerationFrame(
  delta: string,
  total: string,
  tokenCount?: number
): StreamFrame {
  return createStreamFrame("generation", {
    delta,
    total,
    tokenCount,
  });
}

export function createValidationFrame(
  report: ValidationReport,
  duration?: number
): StreamFrame {
  return createStreamFrame("validation", {
    report,
    duration,
  });
}

export function createErrorFrame(
  message: string,
  recoverable: boolean = true,
  code?: string,
  details?: unknown
): StreamFrame {
  return createStreamFrame("error", {
    message,
    recoverable,
    code,
    details,
  });
}

export function createResultFrame(
  success: boolean,
  finalDraft: string,
  totalAttempts: number,
  totalDuration: number
): StreamFrame {
  return createStreamFrame("result", {
    success,
    finalDraft,
    totalAttempts,
    totalDuration,
  });
}

/**
 * Error recovery utilities
 */
export class StreamingError extends Error {
  constructor(
    message: string,
    public recoverable: boolean = true,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "StreamingError";
  }

  toStreamFrame(): StreamFrame {
    return createErrorFrame(
      this.message,
      this.recoverable,
      this.code,
      this.details
    );
  }
}

export function withErrorRecovery<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return operation().catch(error => {
    if (error instanceof StreamingError) {
      throw error;
    }

    // Convert unknown errors to StreamingError
    const message = error instanceof Error ? error.message : String(error);
    throw new StreamingError(
      `${operationName} failed: ${message}`,
      true, // Most errors are recoverable by default
      error instanceof Error ? error.name : "UnknownError",
      error
    );
  });
}
