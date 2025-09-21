import { useCallback, useRef, useState } from "react";

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

export function useStreamingWorkflow() {
  const [streaming, setStreaming] = useState(false);
  const [phase, setPhase] = useState<string>("");
  const [attempt, setAttempt] = useState<number>(0);
  const [draft, setDraft] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const textRef = useRef<string>("");

  const processStreamChunk = useCallback(
    (chunk: string, spec: string) => {
      for (const line of chunk.split("\n")) {
        if (!line.trim()) continue;

        try {
          const parsed: unknown = JSON.parse(line);
          if (!isStreamFrame(parsed)) continue;

          const obj = parsed;
          switch (obj.type) {
            case "phase":
              setPhase(obj.data.phase);
              setAttempt(obj.data.attempt);
              break;

            case "generation":
              textRef.current += obj.data.delta;
              setDraft(textRef.current);
              break;

            case "validation":
              setIssues(obj.data.report.issues);
              break;

            case "result":
              setDraft(obj.data.finalDraft);
              break;

            case "error": {
              setPhase("error");
              const errorCode: ErrorCode = isErrorCode(obj.data.code)
                ? obj.data.code
                : "UNEXPECTED_ERROR";

              const errorDetails: ErrorDetails = {
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

              setErrorDetails(errorDetails);
              setStreaming(false);
              return true; // Signal to break from stream reading
            }

            case "self-review":
            case "healing":
              // Handle these cases if needed in the future
              break;

            default:
              // Handle unknown stream frame types
              break;
          }
        } catch (parseError) {
          // Skip invalid JSON lines - this is expected during streaming
          console.warn("Failed to parse streaming line:", line, {
            error:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),
          });
        }
      }
      return false; // Continue streaming
    },
    [phase, attempt]
  );

  const startWorkflow = useCallback(
    async (spec: string) => {
      setStreaming(true);
      setDraft("");
      textRef.current = "";
      setIssues([]);
      setErrorDetails(null);
      setPhase("starting");
      setAttempt(1);
      setStartTime(Date.now());
      setElapsedTime(0);

      const res = await fetch("/api/run", {
        method: "POST",
        body: JSON.stringify({ specText: spec }),
      });

      if (res.body === null) {
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const shouldBreak = processStreamChunk(chunk, spec);
        if (shouldBreak) break;
      }

      setStreaming(false);
    },
    [processStreamChunk]
  );

  return {
    streaming,
    phase,
    attempt,
    draft,
    issues,
    startTime,
    elapsedTime,
    errorDetails,
    setElapsedTime,
    startWorkflow,
  };
}
