import { useCallback, useMemo, useState } from "react";

import { DEFAULT_ENTERPRISE_PARAMETERS } from "@/types/workflow";

import type {
  ContentOutline,
  EnterpriseParameters,
  StructuredWorkflowState,
  WorkflowStep,
} from "@/types/workflow";

import { generateContentOutline } from "./contentOutlineHelpers";

import {
  canNavigateBack,
  canNavigateNext,
  findNextStep,
  findPreviousStep,
} from "./navigationHelpers";

import { calculateStepProgress } from "./progressCalculationHelpers";
import { serializeToSpecText } from "./serializationHelpers";
// Initial state for the workflow
const initialState: StructuredWorkflowState = {
  currentStep: "idea",
  initialPrompt: "",
  contentOutline: {
    functionalRequirements: [],
    successMetrics: [],
    milestones: [],
  },
  enterpriseParameters: DEFAULT_ENTERPRISE_PARAMETERS,
  selectedSections: [],
  sectionContents: {},
  sectionOrder: [],
  finalPrd: "",
  progress: {
    step: 1,
    totalSteps: 4,
    stepName: "Idea Capture",
    completion: 0,
    canGoBack: false,
    canGoNext: false,
  },
  isLoading: false,
};

export const useStructuredWorkflow = () => {
  const [state, setState] = useState<StructuredWorkflowState>(initialState);

  // Calculate current progress using helper
  const progress = useMemo(() => calculateStepProgress(state), [state]);

  // Update the state with calculated progress
  const currentState = useMemo(
    () => ({
      ...state,
      progress,
    }),
    [state, progress]
  );

  const setInitialPrompt = useCallback((prompt: string) => {
    setState((prev) => ({ ...prev, initialPrompt: prompt }));
  }, []);

  // Keep for backward compatibility (not used in new workflow)

  const setContentOutline = useCallback((outline: ContentOutline) => {
    setState((prev) => ({ ...prev, contentOutline: outline }));
  }, []);

  const setEnterpriseParameters = useCallback(
    (parameters: EnterpriseParameters) => {
      setState((prev) => ({ ...prev, enterpriseParameters: parameters }));
    },
    []
  );

  const setSelectedSections = useCallback((sectionIds: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedSections: sectionIds,
      sectionOrder: sectionIds,
    }));
  }, []);

  const updateSectionContent = useCallback(
    (sectionId: string, content: string) => {
      setState((prev) => ({
        ...prev,
        sectionContents: {
          ...prev.sectionContents,
          [sectionId]: content,
        },
      }));
    },
    []
  );

  const reorderSections = useCallback((newOrder: string[]) => {
    setState((prev) => ({ ...prev, sectionOrder: newOrder }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error?: string) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setFinalPrd = useCallback((prd: string) => {
    setState((prev) => ({ ...prev, finalPrd: prd }));
  }, []);

  // Navigation functions using helpers
  const goToNextStep = useCallback(() => {
    if (!canNavigateNext(currentState.progress.canGoNext)) return;

    const nextStep = findNextStep(state.currentStep);
    if (nextStep) {
      setState((prev) => ({ ...prev, currentStep: nextStep }));
    }
  }, [currentState.progress.canGoNext, state.currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (!canNavigateBack(currentState.progress.canGoBack)) return;

    const prevStep = findPreviousStep(state.currentStep);
    if (prevStep) {
      setState((prev) => ({ ...prev, currentStep: prevStep }));
    }
  }, [currentState.progress.canGoBack, state.currentStep]);

  const goToStep = useCallback((step: WorkflowStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(initialState);
  }, []);

  const generateContentOutlineForPrompt = useCallback(
    (prompt: string) => {
      const outline = generateContentOutline(prompt);
      setContentOutline(outline);
    },
    [setContentOutline]
  );

  const serializeToSpecTextCallback = useCallback((): string => {
    return serializeToSpecText(state);
  }, [state]);

  return {
    state: currentState,
    setInitialPrompt,
    setContentOutline,
    setEnterpriseParameters,
    setSelectedSections,
    updateSectionContent,
    reorderSections,
    setLoading,
    setError,
    setFinalPrd,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetWorkflow,
    generateContentOutlineForPrompt,
    serializeToSpecText: serializeToSpecTextCallback,
  };
};
