import { useCallback, useMemo, useState } from "react";

import {
  WORKFLOW_STEPS,
  type StructuredWorkflowState,
  type WorkflowStep,
} from "@/types/workflow";

import {
  MIN_PROMPT_LENGTH,
  calculateStepProgress,
} from "./progressCalculationHelpers";

import { runAgenticRefinementLoop } from "./refinementLoop";
import { useOutlineActions } from "./useOutlineActions";

import {
  requestEvaluation,
  requestOutline,
  streamDraft,
  streamRefinement,
} from "./workflowApi";

const TOTAL_WORKFLOW_STEPS = WORKFLOW_STEPS.length;
const INITIAL_STEP_NAME = WORKFLOW_STEPS[0].name;
const MAX_REFINEMENT_LOOPS = 5;

const INITIAL_STATE: StructuredWorkflowState = {
  currentStep: "idea",
  brief: "",
  outline: null,
  draft: "",
  finalDraft: "",
  evaluationReport: null,
  iteration: 0,
  status: "idle",
  progress: {
    step: 1,
    totalSteps: TOTAL_WORKFLOW_STEPS,
    stepName: INITIAL_STEP_NAME,
    completion: 0,
    canGoBack: false,
    canGoNext: false,
  },
  isLoading: false,
  error: undefined,
};

export const useStructuredWorkflow = () => {
  const [state, setState] = useState<StructuredWorkflowState>(INITIAL_STATE);

  const progress = useMemo(() => calculateStepProgress(state), [state]);
  const currentState = useMemo(
    () => ({
      ...state,
      progress,
    }),
    [state, progress]
  );

  const setBrief = useCallback((brief: string) => {
    setState((prev) => {
      const shouldClearError =
        typeof prev.error === "string" &&
        prev.error.length > 0 &&
        brief.trim().length >= MIN_PROMPT_LENGTH;

      return {
        ...prev,
        brief,
        error: shouldClearError ? undefined : prev.error,
      };
    });
  }, []);

  const { setOutline, addSection, updateSection, removeSection, moveSection } =
    useOutlineActions(setState);

  const setError = useCallback((error?: string | null) => {
    setState((prev) => ({ ...prev, error: error ?? undefined }));
  }, []);

  const generateOutline = useCallback(async () => {
    const brief = state.brief.trim();
    if (brief.length < MIN_PROMPT_LENGTH) {
      const errorMessage =
        "Please add more detail before generating an outline.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      status: "outline",
      error: undefined,
    }));

    try {
      const outline = await requestOutline(brief);
      setOutline(outline);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        status: "idle",
      }));
      return outline;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate outline";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        status: "idle",
        error: message,
      }));
      throw error;
    }
  }, [setOutline, state.brief]);

  const runRefinementLoop = useCallback(async (initialDraft: string) => {
    const result = await runAgenticRefinementLoop({
      initialDraft,
      maxIterations: MAX_REFINEMENT_LOOPS,
      evaluate: requestEvaluation,
      refine: streamRefinement,
      onEvaluating: (iteration) => {
        setState((prev) => ({
          ...prev,
          status: "evaluating",
          iteration,
        }));
      },
      onNoIssues: () => {
        setState((prev) => ({
          ...prev,
          evaluationReport: [],
        }));
      },
      onLimitReached: (report) => {
        setState((prev) => ({
          ...prev,
          evaluationReport: report,
        }));
      },
      onRefining: (iteration, report) => {
        setState((prev) => ({
          ...prev,
          status: "refining",
          iteration,
          evaluationReport: report,
        }));
      },
      onDraftUpdate: (content) => {
        setState((prev) => ({ ...prev, draft: content }));
      },
    });

    setState((prev) => ({
      ...prev,
      status: "idle",
      isLoading: false,
      draft: result.draft,
      finalDraft: result.draft,
      evaluationReport: result.report ?? [],
      iteration: result.iterations,
      error:
        result.limitHit && result.report != null && result.report.length > 0
          ? "Reached refinement limit. Review remaining issues."
          : prev.error,
    }));

    return result;
  }, []);

  const generateDraft = useCallback(async () => {
    const outline = state.outline;
    if (!outline || outline.sections.length === 0) {
      const errorMessage =
        "Generate an outline with at least one section first.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      status: "generating",
      draft: "",
      finalDraft: "",
      evaluationReport: null,
      iteration: 0,
      error: undefined,
    }));

    try {
      const initialDraft = await streamDraft(outline, (content) => {
        setState((prev) => ({ ...prev, draft: content }));
      });

      await runRefinementLoop(initialDraft);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate draft";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        status: "idle",
        error: message,
      }));
      throw error;
    }
  }, [runRefinementLoop, state.outline]);

  const goToNextStep = useCallback(() => {
    if (!currentState.progress.canGoNext) {
      return;
    }

    const currentIndex = WORKFLOW_STEPS.findIndex(
      (step) => step.id === state.currentStep
    );
    const nextStep = WORKFLOW_STEPS[currentIndex + 1]?.id as
      | WorkflowStep
      | undefined;

    if (nextStep) {
      setState((prev) => ({ ...prev, currentStep: nextStep }));
    }
  }, [currentState.progress.canGoNext, state.currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (!currentState.progress.canGoBack) {
      return;
    }

    const currentIndex = WORKFLOW_STEPS.findIndex(
      (step) => step.id === state.currentStep
    );
    const prevStep = WORKFLOW_STEPS[currentIndex - 1]?.id as
      | WorkflowStep
      | undefined;

    if (prevStep) {
      setState((prev) => ({ ...prev, currentStep: prevStep }));
    }
  }, [currentState.progress.canGoBack, state.currentStep]);

  const goToStep = useCallback((step: WorkflowStep) => {
    const isValidStep = WORKFLOW_STEPS.some(({ id }) => id === step);
    if (!isValidStep) {
      return;
    }

    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state: currentState,
    setBrief,
    setOutline,
    addSection,
    updateSection,
    removeSection,
    moveSection,
    setError,
    generateOutline,
    generateDraft,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetWorkflow,
  } as const;
};
