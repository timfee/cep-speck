import { useCallback, useState } from "react";

import type { Issue } from "@/lib/spec/types";

interface GenerationState {
  generatedPrd: string;
  isGenerating: boolean;
  phase: string;
  progress: number;
  attempt: number;
  validationIssues: Issue[];
  error: string | null;
}

interface GenerationActions {
  beginGeneration: () => void;
  completeGeneration: (draft: string) => void;
  failGeneration: (message: string) => void;
  finishGeneration: () => void;
  resetGeneration: () => void;
  setPhase: (value: string) => void;
  setProgress: (value: number) => void;
  setAttempt: (value: number) => void;
  setGeneratedPrd: (value: string) => void;
  setValidationIssues: (issues: Issue[]) => void;
}

interface GenerationStore {
  state: GenerationState;
  actions: GenerationActions;
}

export function usePrdGenerationStore(
  onGenerationComplete?: (generatedPrd: string) => void
): GenerationStore {
  const [generatedPrd, setGeneratedPrd] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState("");
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [validationIssues, setValidationIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);

  const beginGeneration = useCallback(() => {
    setIsGenerating(true);
    setError(null);
    setGeneratedPrd("");
    setProgress(0);
    setPhase("");
    setAttempt(0);
    setValidationIssues([]);
  }, []);

  const completeGeneration = useCallback(
    (draft: string) => {
      setGeneratedPrd(draft);
      setProgress(100);
      setPhase("done");
      onGenerationComplete?.(draft);
    },
    [onGenerationComplete]
  );

  const failGeneration = useCallback((message: string) => {
    setError(message);
    setPhase("error");
    setProgress(0);
  }, []);

  const finishGeneration = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const resetGeneration = useCallback(() => {
    setGeneratedPrd("");
    setIsGenerating(false);
    setPhase("");
    setProgress(0);
    setAttempt(0);
    setValidationIssues([]);
    setError(null);
  }, []);

  return {
    state: {
      generatedPrd,
      isGenerating,
      phase,
      progress,
      attempt,
      validationIssues,
      error,
    },
    actions: {
      beginGeneration,
      completeGeneration,
      failGeneration,
      finishGeneration,
      resetGeneration,
      setPhase,
      setProgress,
      setAttempt,
      setGeneratedPrd,
      setValidationIssues,
    },
  };
}
