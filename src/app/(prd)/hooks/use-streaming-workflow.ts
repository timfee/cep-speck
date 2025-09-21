import { useCallback, useRef, useState } from "react";

import type { ErrorDetails } from "@/lib/error/types";
import { processStreamLine } from "@/lib/spec/helpers/stream-helpers";
import type { Issue } from "@/lib/spec/types";


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

  const processChunk = useCallback(
    (chunk: string, spec: string) => {
      const handlers = {
        setPhase,
        setAttempt,
        setDraft,
        setIssues,
        setErrorDetails,
        setStreaming,
        textRef,
        phase,
        attempt,
      };

      for (const line of chunk.split("\n")) {
        const shouldBreak = processStreamLine(line, spec, handlers);
        if (shouldBreak) return true;
      }
      return false;
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
        const shouldBreak = processChunk(chunk, spec);
        if (shouldBreak) break;
      }

      setStreaming(false);
    },
    [processChunk]
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
