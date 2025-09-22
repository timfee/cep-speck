/**
 * Enhanced PRD generation with progress tracking and validation feedback
 * Addresses BLOCKER 4: Missing Workflow Integration
 */

import { useState, useCallback } from 'react';

import { serializeWorkflowToSpec } from '@/lib/serializers/workflow-to-spec';
import type { Issue } from '@/lib/spec/types';
import { StreamProcessor, getProgressForPhase } from '@/lib/streaming/stream-processor';
import type { StructuredWorkflowState } from '@/types/workflow';

export function usePrdGeneration(onGenerationComplete?: (generatedPrd: string) => void) {
  const [generatedPrd, setGeneratedPrd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState('');
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [validationIssues, setValidationIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to handle completion
  const handleGenerationComplete = useCallback((finalDraft: string) => {
    setGeneratedPrd(finalDraft);
    setProgress(100);
    setPhase('done');
    if (onGenerationComplete) {
      onGenerationComplete(finalDraft);
    }
  }, [onGenerationComplete]);
  
  const generatePrd = useCallback(async (state: StructuredWorkflowState) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedPrd('');
    setProgress(0);
    setPhase('');
    setAttempt(0);
    setValidationIssues([]);
    
    try {
      // Serialize structured state to spec text
      const specText = serializeWorkflowToSpec(state);
      
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specText, maxAttempts: 3 }),
      });
      
      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }
      
      const processor = new StreamProcessor();
      const reader = response.body!.getReader();
      let accumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const frames = processor.processChunk(value);
        
        for (const frame of frames) {
          switch (frame.type) {
            case 'phase':
              setPhase(frame.data.phase);
              setProgress(getProgressForPhase(frame.data.phase));
              if (frame.data.attempt !== undefined) {
                setAttempt(frame.data.attempt);
              }
              break;
              
            case 'generation':
              if (frame.data.delta) {
                accumulatedContent += frame.data.delta;
                setGeneratedPrd(accumulatedContent);
              }
              break;
              
            case 'result':
              if (frame.data.finalDraft) {
                handleGenerationComplete(frame.data.finalDraft);
              }
              break;
              
            case 'validation':
              if (frame.data.report && !frame.data.report.ok) {
                setValidationIssues(frame.data.report.issues || []);
              } else {
                setValidationIssues([]);
              }
              break;
              
            case 'error':
              throw new Error(frame.data.message || 'Generation failed');
              
            default:
              // Handle unknown frame types gracefully
              console.log('Unknown frame type:', frame.type);
              break;
          }
        }
      }
      
      // Process remaining frames
      const finalFrames = processor.flush();
      for (const frame of finalFrames) {
        if (frame.type === 'result' && frame.data.finalDraft) {
          handleGenerationComplete(frame.data.finalDraft);
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      setPhase('error');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  }, [handleGenerationComplete]);
  
  const resetGeneration = useCallback(() => {
    setGeneratedPrd('');
    setIsGenerating(false);
    setPhase('');
    setProgress(0);
    setAttempt(0);
    setValidationIssues([]);
    setError(null);
  }, []);
  
  return {
    generatedPrd,
    isGenerating,
    phase,
    progress,
    attempt,
    validationIssues,
    error,
    generatePrd,
    resetGeneration,
  };
}