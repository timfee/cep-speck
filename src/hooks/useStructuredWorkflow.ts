import { useState, useCallback, useMemo } from 'react';
import type { 
  StructuredWorkflowState, 
  WorkflowStep, 
  SectionDefinition, 
  WorkflowProgress 
} from '@/types/workflow';
import { AVAILABLE_SECTIONS, WORKFLOW_STEPS } from '@/types/workflow';

const initialState: StructuredWorkflowState = {
  currentStep: 'idea',
  initialPrompt: '',
  suggestedSections: [],
  selectedSections: [],
  sectionContents: {},
  sectionOrder: [],
  finalPrd: '',
  progress: {
    step: 1,
    totalSteps: 4,
    stepName: 'Idea Capture',
    completion: 0,
    canGoBack: false,
    canGoNext: false
  },
  isLoading: false
};

export const useStructuredWorkflow = () => {
  const [state, setState] = useState<StructuredWorkflowState>(initialState);

  // Calculate current progress
  const progress = useMemo((): WorkflowProgress => {
    const stepIndex = WORKFLOW_STEPS.findIndex(s => s.id === state.currentStep);
    const stepInfo = WORKFLOW_STEPS[stepIndex];
    
    let canGoNext = false;
    let completion = 0;

    switch (state.currentStep) {
      case 'idea':
        canGoNext = state.initialPrompt.trim().length > 10;
        completion = Math.min(100, (state.initialPrompt.length / 50) * 100);
        break;
      case 'structure':
        canGoNext = state.selectedSections.length > 0;
        completion = state.selectedSections.length > 0 ? 100 : 0;
        break;
      case 'sections':
        const requiredSections = state.selectedSections.filter(id => {
          const section = AVAILABLE_SECTIONS.find(s => s.id === id);
          return section?.required;
        });
        const completedRequiredSections = requiredSections.filter(id => 
          state.sectionContents[id]?.trim().length > 0
        );
        canGoNext = completedRequiredSections.length === requiredSections.length;
        completion = requiredSections.length > 0 ? 
          (completedRequiredSections.length / requiredSections.length) * 100 : 100;
        break;
      case 'generate':
        canGoNext = true;
        completion = state.finalPrd ? 100 : 0;
        break;
      case 'complete':
        canGoNext = false;
        completion = 100;
        break;
    }

    return {
      step: stepIndex + 1,
      totalSteps: WORKFLOW_STEPS.length,
      stepName: stepInfo?.name || 'Unknown',
      completion,
      canGoBack: stepIndex > 0,
      canGoNext
    };
  }, [state.currentStep, state.initialPrompt, state.selectedSections, state.sectionContents, state.finalPrd]);

  // Update the state with calculated progress
  const currentState = useMemo(() => ({
    ...state,
    progress
  }), [state, progress]);

  const setInitialPrompt = useCallback((prompt: string) => {
    setState(prev => ({ ...prev, initialPrompt: prompt }));
  }, []);

  const setSuggestedSections = useCallback((sections: SectionDefinition[]) => {
    setState(prev => ({ ...prev, suggestedSections: sections }));
  }, []);

  const setSelectedSections = useCallback((sectionIds: string[]) => {
    setState(prev => ({ 
      ...prev, 
      selectedSections: sectionIds,
      sectionOrder: sectionIds 
    }));
  }, []);

  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    setState(prev => ({
      ...prev,
      sectionContents: {
        ...prev.sectionContents,
        [sectionId]: content
      }
    }));
  }, []);

  const reorderSections = useCallback((newOrder: string[]) => {
    setState(prev => ({ ...prev, sectionOrder: newOrder }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error?: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setFinalPrd = useCallback((prd: string) => {
    setState(prev => ({ ...prev, finalPrd: prd }));
  }, []);

  const goToNextStep = useCallback(() => {
    if (!currentState.progress.canGoNext) return;

    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === state.currentStep);
    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      const nextStep = WORKFLOW_STEPS[currentIndex + 1].id as WorkflowStep;
      setState(prev => ({ ...prev, currentStep: nextStep }));
    }
  }, [currentState.progress.canGoNext, state.currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (!currentState.progress.canGoBack) return;

    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === state.currentStep);
    if (currentIndex > 0) {
      const prevStep = WORKFLOW_STEPS[currentIndex - 1].id as WorkflowStep;
      setState(prev => ({ ...prev, currentStep: prevStep }));
    }
  }, [currentState.progress.canGoBack, state.currentStep]);

  const goToStep = useCallback((step: WorkflowStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state: currentState,
    setInitialPrompt,
    setSuggestedSections,
    setSelectedSections,
    updateSectionContent,
    reorderSections,
    setLoading,
    setError,
    setFinalPrd,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetWorkflow
  };
};