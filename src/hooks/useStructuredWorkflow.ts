import { useState, useCallback, useMemo } from 'react';

import { WORKFLOW_STEPS, DEFAULT_ENTERPRISE_PARAMETERS } from '@/types/workflow';

import type { 
  StructuredWorkflowState, 
  WorkflowStep, 
  ContentOutline,
  EnterpriseParameters,
  WorkflowProgress 
} from '@/types/workflow';

// Validation constants
export const MIN_PROMPT_LENGTH = 10;
export const PROMPT_COMPLETION_TARGET = 50;

// Helper function to generate content outline based on prompt
const generateContentOutline = (prompt: string): ContentOutline => {
  const lowercasePrompt = prompt.toLowerCase();
  
  // Generate functional requirements based on prompt analysis
  const functionalRequirements = [];
  
  // Basic requirements that are always included
  functionalRequirements.push({
    id: 'fr-core-functionality',
    title: 'Core Product Functionality',
    description: 'Primary product capabilities and core user workflows',
    priority: 'P0' as const,
    userStory: 'As a user, I want to access the main product features seamlessly',
    acceptanceCriteria: ['Feature is accessible', 'Performance meets standards', 'User experience is intuitive']
  });

  // Add authentication if enterprise/security mentioned
  if (lowercasePrompt.includes('enterprise') || lowercasePrompt.includes('security') || lowercasePrompt.includes('admin')) {
    functionalRequirements.push({
      id: 'fr-auth-security',
      title: 'Authentication & Security',
      description: 'Enterprise-grade authentication and security controls',
      priority: 'P0' as const,
      userStory: 'As an admin, I want to ensure secure access to enterprise features',
      acceptanceCriteria: ['SSO integration', 'Role-based access control', 'Audit logging']
    });
  }

  // Add integration requirement if mentioned
  if (lowercasePrompt.includes('integration') || lowercasePrompt.includes('api') || lowercasePrompt.includes('connect')) {
    functionalRequirements.push({
      id: 'fr-integrations',
      title: 'Third-party Integrations',
      description: 'Integration capabilities with existing enterprise systems',
      priority: 'P1' as const,
      userStory: 'As an organization, I want to integrate with our existing tools and workflows',
      acceptanceCriteria: ['API compatibility', 'Data synchronization', 'Error handling']
    });
  }

  // Generate success metrics
  const successMetrics = [
    {
      id: 'sm-adoption',
      name: 'User Adoption Rate',
      description: 'Percentage of target users actively using the product',
      type: 'adoption' as const,
      target: '80% adoption within 6 months',
      measurement: 'Monthly Active Users / Total Enrolled Users',
      frequency: 'Monthly'
    },
    {
      id: 'sm-engagement',
      name: 'Feature Engagement',
      description: 'How frequently users engage with core features',
      type: 'engagement' as const,
      target: '5+ sessions per user per week',
      measurement: 'Average sessions per user per week',
      frequency: 'Weekly'
    }
  ];

  // Add business metrics if relevant
  if (lowercasePrompt.includes('business') || lowercasePrompt.includes('roi') || lowercasePrompt.includes('cost')) {
    successMetrics.push({
      id: 'sm-business-impact',
      name: 'Business Impact',
      description: 'Measurable business value and ROI from product adoption',
      type: 'adoption' as const,
      target: '15% productivity improvement',
      measurement: 'Time saved per user per week',
      frequency: 'Quarterly'
    });
  }

  // Generate milestones
  const milestones = [
    {
      id: 'ms-research',
      title: 'Research & Discovery',
      description: 'User research, competitive analysis, and requirements gathering',
      phase: 'research' as const,
      estimatedDate: 'Month 1',
      deliverables: ['User research report', 'Competitive analysis', 'Technical requirements']
    },
    {
      id: 'ms-design',
      title: 'Design & Prototyping',
      description: 'UI/UX design, user flows, and interactive prototypes',
      phase: 'design' as const,
      estimatedDate: 'Month 2',
      deliverables: ['Design system', 'User flows', 'Interactive prototypes']
    },
    {
      id: 'ms-mvp',
      title: 'MVP Development',
      description: 'Core functionality development and initial testing',
      phase: 'development' as const,
      estimatedDate: 'Month 4',
      deliverables: ['MVP build', 'Internal testing', 'Documentation']
    },
    {
      id: 'ms-launch',
      title: 'Beta Launch',
      description: 'Limited release to pilot users and feedback collection',
      phase: 'testing' as const,
      estimatedDate: 'Month 5',
      deliverables: ['Beta release', 'User feedback', 'Performance metrics']
    },
    {
      id: 'ms-ga',
      title: 'General Availability',
      description: 'Full product launch and rollout to all users',
      phase: 'launch' as const,
      estimatedDate: 'Month 6',
      deliverables: ['GA release', 'Marketing materials', 'Support documentation']
    }
  ];

  return {
    functionalRequirements,
    successMetrics,
    milestones,
    executiveSummary: {
      problemStatement: 'Extract problem statement from user input',
      proposedSolution: 'Define solution approach based on requirements',
      businessValue: 'Articulate expected business value and ROI',
      targetUsers: 'Identify primary and secondary user personas'
    }
  };
};

const initialState: StructuredWorkflowState = {
  currentStep: 'idea',
  initialPrompt: '',
  contentOutline: {
    functionalRequirements: [],
    successMetrics: [],
    milestones: [],
    executiveSummary: {
      problemStatement: '',
      proposedSolution: '',
      businessValue: '',
      targetUsers: ''
    }
  },
  enterpriseParameters: DEFAULT_ENTERPRISE_PARAMETERS,
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
    
    // Ensure valid step index
    if (stepIndex === -1) {
      return {
        step: 1,
        totalSteps: WORKFLOW_STEPS.length,
        stepName: 'Unknown',
        completion: 0,
        canGoBack: false,
        canGoNext: false
      };
    }
    
    const stepInfo = WORKFLOW_STEPS[stepIndex];
    
    let canGoNext = false;
    let completion = 0;

    switch (state.currentStep) {
      case 'idea':
        canGoNext = state.initialPrompt.trim().length > MIN_PROMPT_LENGTH;
        completion = Math.min(100, (state.initialPrompt.length / PROMPT_COMPLETION_TARGET) * 100);
        break;
      case 'outline': {
        const totalItems = state.contentOutline.functionalRequirements.length + 
                          state.contentOutline.successMetrics.length + 
                          state.contentOutline.milestones.length;
        canGoNext = totalItems > 0;
        completion = totalItems > 0 ? 100 : 0;
        break;
      }
      case 'parameters':
        canGoNext = true; // Enterprise parameters are optional
        completion = 100;
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
      stepName: stepInfo.name,
      completion,
      canGoBack: stepIndex > 0,
      canGoNext
    };
  }, [state.currentStep, state.initialPrompt, state.contentOutline.functionalRequirements.length, state.contentOutline.successMetrics.length, state.contentOutline.milestones.length, state.finalPrd]);

  // Update the state with calculated progress
  const currentState = useMemo(() => ({
    ...state,
    progress
  }), [state, progress]);

  const setInitialPrompt = useCallback((prompt: string) => {
    setState(prev => ({ ...prev, initialPrompt: prompt }));
  }, []);

  // Keep for backward compatibility (not used in new workflow)

  const setContentOutline = useCallback((outline: ContentOutline) => {
    setState(prev => ({ ...prev, contentOutline: outline }));
  }, []);

  const setEnterpriseParameters = useCallback((parameters: EnterpriseParameters) => {
    setState(prev => ({ ...prev, enterpriseParameters: parameters }));
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

  const generateContentOutlineForPrompt = useCallback((prompt: string) => {
    const outline = generateContentOutline(prompt);
    setContentOutline(outline);
  }, [setContentOutline]);

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
    generateContentOutlineForPrompt
  };
};