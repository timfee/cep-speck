import { useCallback, useState } from 'react';

import type { StructuredOutline, EvaluationIssue } from '@/lib/agents/types';

export type AgenticPhase = 'idea' | 'outline' | 'draft' | 'evaluating' | 'refining' | 'complete' | 'error';

export interface AgenticWorkflowState {
  phase: AgenticPhase;
  brief: string;
  outline: StructuredOutline | null;
  draft: string;
  evaluationIssues: EvaluationIssue[];
  isLoading: boolean;
  error: string | null;
  attempt: number;
  maxAttempts: number;
}

const initialState: AgenticWorkflowState = {
  phase: 'idea',
  brief: '',
  outline: null,
  draft: '',
  evaluationIssues: [],
  isLoading: false,
  error: null,
  attempt: 0,
  maxAttempts: 5,
};

/**
 * New agentic workflow hook that orchestrates the 4-phase agent chain
 */
export const useAgenticWorkflow = () => {
  const [state, setState] = useState<AgenticWorkflowState>(initialState);

  const setBrief = useCallback((brief: string) => {
    setState(prev => ({ ...prev, brief }));
  }, []);

  const setOutline = useCallback((outline: StructuredOutline) => {
    setState(prev => ({ ...prev, outline }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(initialState);
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false, phase: error !== null ? 'error' : prev.phase }));
  }, []);

  /**
   * Phase 1: Generate outline from brief
   */
  const generateOutline = useCallback(async () => {
    if (!state.brief || state.brief.trim().length === 0) {
      setError('Please enter a brief first');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, phase: 'outline' }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'outline', brief: state.brief }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate outline: ${response.statusText}`);
      }

      const outline = await response.json() as StructuredOutline;
      setState(prev => ({ ...prev, outline, isLoading: false }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate outline');
    }
  }, [state.brief, setError]);

  /**
   * Phase 2: Generate draft from outline
   */
  const generateDraft = useCallback(async () => {
    if (!state.outline) {
      setError('Please generate an outline first');
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      phase: 'draft',
      draft: '',
      attempt: prev.attempt + 1
    }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'draft', outline: state.outline }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate draft: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let draftContent = '';
      const decoder = new TextDecoder();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        draftContent += chunk;
        
        // Update draft content as it streams
        setState(prev => ({ ...prev, draft: draftContent }));
      }

      // Draft complete, automatically start evaluation
      await evaluateDraftInternal(draftContent);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate draft');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.outline, setError]);

  /**
   * Internal evaluation function to avoid dependency cycles
   */
  const evaluateDraftInternal = useCallback(async (draftToEvaluate: string) => {
    setState(prev => ({ ...prev, isLoading: true, phase: 'evaluating' }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'evaluate', draft: draftToEvaluate }),
      });

      if (!response.ok) {
        throw new Error(`Failed to evaluate draft: ${response.statusText}`);
      }

      const issues = await response.json() as EvaluationIssue[];
      
      if (issues.length === 0) {
        // No issues found - workflow complete!
        setState(prev => ({ ...prev, evaluationIssues: [], isLoading: false, phase: 'complete' }));
      } else {
        // Issues found - start refinement
        setState(prev => ({ ...prev, evaluationIssues: issues }));
        await refineDraftInternal(draftToEvaluate, issues);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to evaluate draft');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setError]);

  /**
   * Internal refinement function to avoid dependency cycles
   */
  const refineDraftInternal = useCallback(async (draftToRefine: string, issues: EvaluationIssue[]) => {
    // Check if we've reached max attempts
    setState(prevState => {
      if (prevState.attempt >= prevState.maxAttempts) {
        return {
          ...prevState,
          isLoading: false, 
          phase: 'complete',
          error: 'Maximum refinement attempts reached. Please review remaining issues.'
        };
      }
      return { ...prevState, isLoading: true, phase: 'refining' };
    });

    // Get current attempt count
    const currentAttempt = state.attempt;
    if (currentAttempt >= state.maxAttempts) {
      return; // Exit early if max attempts reached
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'refine', draft: draftToRefine, report: issues }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refine draft: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let refinedContent = '';
      const decoder = new TextDecoder();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        refinedContent += chunk;
        
        // Update draft content as it streams
        setState(prev => ({ ...prev, draft: refinedContent }));
      }

      // Refinement complete, evaluate again
      await evaluateDraftInternal(refinedContent);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refine draft');
    }
  }, [state.attempt, state.maxAttempts, setError, evaluateDraftInternal]);

  /**
   * Phase 3: Evaluate draft for issues (public interface)
   */
  const evaluateDraft = useCallback(async (draftToEvaluate?: string) => {
    const draft = draftToEvaluate ?? state.draft;
    if (!draft || draft.trim().length === 0) {
      setError('No draft to evaluate');
      return;
    }

    await evaluateDraftInternal(draft);
  }, [state.draft, setError, evaluateDraftInternal]);

  /**
   * Phase 4: Refine draft to fix issues (public interface)
   */
  const refineDraft = useCallback(async (draftToRefine: string, issues: EvaluationIssue[]) => {
    await refineDraftInternal(draftToRefine, issues);
  }, [refineDraftInternal]);

  return {
    state,
    setBrief,
    setOutline,
    resetWorkflow,
    generateOutline,
    generateDraft,
    evaluateDraft,
    refineDraft,
  };
};