import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import type { Issue, StreamPhase } from "@/lib/spec/types";

import {
  generationReducer,
  createGenerationState,
  type GenerationState,
} from "./generation-reducer";

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
  const [state, dispatch] = useReducer(generationReducer, undefined, () =>
    createGenerationState()
  );
  const onCompleteRef =
    useRef<(draft: string) => void | undefined>(onGenerationComplete);

  useEffect(() => {
    onCompleteRef.current = onGenerationComplete;
  }, [onGenerationComplete]);

  const beginGeneration = useCallback(() => {
    dispatch({ type: "BEGIN_GENERATION" });
  }, []);

  const completeGeneration = useCallback((draft: string) => {
    dispatch({ type: "COMPLETE_GENERATION", draft });
    onCompleteRef.current?.(draft);
  }, []);

  const failGeneration = useCallback((message: string) => {
    dispatch({ type: "FAIL_GENERATION", message });
  }, []);

  const finishGeneration = useCallback(() => {
    dispatch({ type: "FINISH_GENERATION" });
  }, []);

  const resetGeneration = useCallback(() => {
    dispatch({ type: "RESET_GENERATION" });
  }, []);

  const setPhase = useCallback((value: string) => {
    dispatch({ type: "SET_PHASE", phase: value });
  }, []);

  const setProgress = useCallback((value: number) => {
    dispatch({ type: "SET_PROGRESS", progress: value });
  }, []);

  const setAttempt = useCallback((value: number) => {
    dispatch({ type: "SET_ATTEMPT", attempt: value });
  }, []);

  const setGeneratedPrd = useCallback((value: string) => {
    dispatch({ type: "SET_GENERATED_PRD", draft: value });
  }, []);

  const setValidationIssues = useCallback((issues: Issue[]) => {
    dispatch({ type: "SET_VALIDATION_ISSUES", issues });
  }, []);

  const setOnCompleteCallback = useCallback(
    (callback: ((draft: string) => void) | undefined) => {
      onCompleteRef.current = callback;
    },
    []
  );

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const updatePhaseStatus = useCallback(
    (phase: StreamPhase, attempt: number | undefined, message?: string) => {
      dispatch({ type: "UPDATE_PHASE_STATUS", phase, attempt, message });
    },
    []
  );

  const recordPhaseIssues = useCallback(
    (phase: StreamPhase, issues: Issue[]) => {
      dispatch({ type: "RECORD_PHASE_ISSUES", phase, issues });
    },
    []
  );

  const applyRefinedDraft = useCallback((draft: string) => {
    dispatch({ type: "APPLY_REFINED_DRAFT", draft });
  }, []);

  const actions = useMemo(
    () => ({
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
    }),
    [
      applyRefinedDraft,
      beginGeneration,
      clearError,
      completeGeneration,
      failGeneration,
      finishGeneration,
      recordPhaseIssues,
      resetGeneration,
      setAttempt,
      setGeneratedPrd,
      setOnCompleteCallback,
      setPhase,
      setProgress,
      setValidationIssues,
      updatePhaseStatus,
    ]
  );

  return {
    state,
    actions,
  };
}
