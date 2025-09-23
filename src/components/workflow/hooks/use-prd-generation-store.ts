import { useCallback, useEffect, useRef, useState } from "react";

import type { Issue, StreamPhase } from "@/lib/spec/types";

interface PhaseStatus {
  attempts: number;
  issues: number;
  lastMessage?: string;
}

interface GenerationState {
  generatedPrd: string;
  isGenerating: boolean;
  phase: string;
  progress: number;
  attempt: number;
  validationIssues: Issue[];
  error: string | null;
  phaseStatus: Partial<Record<StreamPhase, PhaseStatus>>;
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
  setOnCompleteCallback: (
    callback: ((draft: string) => void) | undefined
  ) => void;
  updatePhaseStatus: (
    phase: StreamPhase,
    attempt: number | undefined,
    message?: string
  ) => void;
  recordPhaseIssues: (phase: StreamPhase, issues: Issue[]) => void;
  applyRefinedDraft: (draft: string) => void;
  clearError: () => void;
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
  const [phaseStatus, setPhaseStatus] = useState<
    Partial<Record<StreamPhase, PhaseStatus>>
  >({});
  const onCompleteRef =
    useRef<(draft: string) => void | undefined>(onGenerationComplete);

  useEffect(() => {
    onCompleteRef.current = onGenerationComplete;
  }, [onGenerationComplete]);

  const beginGeneration = useCallback(() => {
    setIsGenerating(true);
    setError(null);
    setGeneratedPrd("");
    setProgress(0);
    setPhase("");
    setAttempt(0);
    setValidationIssues([]);
    setPhaseStatus({});
  }, []);

  const completeGeneration = useCallback((draft: string) => {
    setGeneratedPrd(draft);
    setProgress(100);
    setPhase("done");
    onCompleteRef.current?.(draft);
  }, []);

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
    setPhaseStatus({});
  }, []);

  const setOnCompleteCallback = useCallback(
    (callback: ((draft: string) => void) | undefined) => {
      onCompleteRef.current = callback;
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updatePhaseStatus = useCallback(
    (phase: StreamPhase, attempt: number | undefined, message?: string) => {
      setPhaseStatus((previous) => {
        const prior = previous[phase] ?? { attempts: 0, issues: 0 };
        const normalizedAttempt = attempt ?? prior.attempts + 1;
        const safeAttempt = normalizedAttempt <= 0 ? 1 : normalizedAttempt;

        return {
          ...previous,
          [phase]: {
            attempts: Math.max(prior.attempts, safeAttempt),
            issues: prior.issues,
            lastMessage: message ?? prior.lastMessage,
          },
        };
      });
    },
    []
  );

  const recordPhaseIssues = useCallback(
    (phase: StreamPhase, issues: Issue[]) => {
      setPhaseStatus((previous) => {
        const prior = previous[phase] ?? { attempts: 0, issues: 0 };
        return {
          ...previous,
          [phase]: {
            ...prior,
            issues: issues.length,
          },
        };
      });
    },
    []
  );

  const applyRefinedDraft = useCallback((draft: string) => {
    setGeneratedPrd(draft);
    setIsGenerating(false);
    setPhase("done");
    setProgress(100);
    setValidationIssues([]);
    setPhaseStatus((previous) => ({
      ...previous,
      validating: (() => {
        const status = previous["validating"];
        return {
          attempts: status?.attempts ?? 0,
          issues: 0,
          lastMessage: status?.lastMessage,
        };
      })(),
      healing: (() => {
        const status = previous["healing"];
        return {
          attempts: Math.max(status?.attempts ?? 0, 1),
          issues: status?.issues ?? 0,
          lastMessage: "Refinement applied",
        };
      })(),
    }));
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
      phaseStatus,
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
      setOnCompleteCallback,
      updatePhaseStatus,
      recordPhaseIssues,
      applyRefinedDraft,
      clearError,
    },
  };
}
