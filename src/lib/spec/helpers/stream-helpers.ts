import type { ErrorCode, ErrorDetails } from "@/lib/error/types";
import type { Issue, StreamFrame } from "@/lib/spec/types";

// Type guards
function isStreamFrame(obj: unknown): obj is StreamFrame {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "type" in obj &&
    "data" in obj &&
    typeof (obj as { type: unknown }).type === "string"
  );
}

function isErrorCode(code: unknown): code is ErrorCode {
  return (
    typeof code === "string" &&
    [
      "MISSING_API_KEY",
      "NETWORK_TIMEOUT",
      "RATE_LIMITED",
      "VALIDATION_FAILED",
      "UNEXPECTED_ERROR",
      "SERVICE_UNAVAILABLE",
      "INVALID_INPUT",
    ].includes(code)
  );
}

interface StreamHandlers {
  setPhase: (phase: string) => void;
  setAttempt: (attempt: number) => void;
  setDraft: (draft: string) => void;
  setIssues: (issues: Issue[]) => void;
  setErrorDetails: (error: ErrorDetails | null) => void;
  setStreaming: (streaming: boolean) => void;
  textRef: { current: string };
  phase: string;
  attempt: number;
}

export function createErrorDetails(
  obj: StreamFrame & { type: "error" },
  spec: string,
  phase: string,
  attempt: number
): ErrorDetails {
  const errorCode: ErrorCode = isErrorCode(obj.data.code)
    ? obj.data.code
    : "UNEXPECTED_ERROR";

  return {
    code: errorCode,
    message: obj.data.message,
    timestamp: Date.now(),
    phase,
    attempt,
    maxAttempts: 3,
    context: {
      specLength: spec.length,
      streaming: true,
    },
    details: obj.data.details,
  };
}

export function processStreamLine(
  line: string,
  spec: string,
  handlers: StreamHandlers
): boolean {
  if (!line.trim()) return false;

  try {
    const parsed: unknown = JSON.parse(line);
    if (!isStreamFrame(parsed)) return false;

    const obj = parsed;
    switch (obj.type) {
      case "phase":
        handlers.setPhase(obj.data.phase);
        handlers.setAttempt(obj.data.attempt);
        break;

      case "generation":
        handlers.textRef.current += obj.data.delta;
        handlers.setDraft(handlers.textRef.current);
        break;

      case "validation":
        handlers.setIssues(obj.data.report.issues);
        break;

      case "result":
        handlers.setDraft(obj.data.finalDraft);
        break;

      case "error": {
        handlers.setPhase("error");
        const errorDetails = createErrorDetails(
          obj,
          spec,
          handlers.phase,
          handlers.attempt
        );
        handlers.setErrorDetails(errorDetails);
        handlers.setStreaming(false);
        return true; // Signal to break from stream reading
      }

      case "self-review":
        // Handle this case if needed in the future
        break;

      default:
        // Handle unknown stream frame types
        break;
    }
  } catch (parseError) {
    // Skip invalid JSON lines - this is expected during streaming
    console.warn("Failed to parse streaming line:", line, {
      error:
        parseError instanceof Error ? parseError.message : String(parseError),
    });
  }
  return false; // Continue streaming
}
