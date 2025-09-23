import type { Issue } from "@/lib/spec/types";

import {
  createFrameHandler,
  createGenerationCallbacks,
} from "./prd-stream-utils";

const MAX_GENERATION_ATTEMPTS = 3;

function sanitizeStreamError(message: string): string {
  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed : "Generation failed";
}

export function normalizeGenerationError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Generation failed";
}

interface StreamHandlerOptions {
  setPhaseWithProgress: (phase: string) => void;
  setAttempt: (value: number) => void;
  setGeneratedPrd: (draft: string) => void;
  completeGeneration: (draft: string) => void;
  setValidationIssues: (issues: Issue[]) => void;
}

export function createGenerationStreamHandler({
  setPhaseWithProgress,
  setAttempt,
  setGeneratedPrd,
  completeGeneration,
  setValidationIssues,
}: StreamHandlerOptions) {
  const contentRef = { current: "" };

  return createFrameHandler(
    createGenerationCallbacks({
      onPhase: (nextPhase, nextAttempt) => {
        setPhaseWithProgress(nextPhase);
        if (typeof nextAttempt === "number") {
          setAttempt(nextAttempt);
        }
      },
      onGeneration: (delta) => {
        const nextDraft = contentRef.current + delta;
        contentRef.current = nextDraft;
        setGeneratedPrd(nextDraft);
      },
      onResult: completeGeneration,
      onValidation: setValidationIssues,
      onSelfReview: () => undefined,
      onError: (message) => {
        throw new Error(sanitizeStreamError(message));
      },
    })
  );
}

export function getGenerationRequestOptions() {
  return { maxAttempts: MAX_GENERATION_ATTEMPTS } as const;
}
