import { useState, useCallback } from 'react';
import type { StreamFrame } from '@/lib/spec/types';

interface UseStreamingOptions {
  onFrame?: (frame: StreamFrame) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

interface StreamingState {
  isRunning: boolean;
  currentPhase: string | null;
  currentMessage: string | null;
  attempt: number;
  progress: number; // 0-100
  error: string | null;
  result: any | null;
  allFrames: StreamFrame[];
}

export function useStreamingGeneration(options: UseStreamingOptions = {}) {
  const [state, setState] = useState<StreamingState>({
    isRunning: false,
    currentPhase: null,
    currentMessage: null,
    attempt: 0,
    progress: 0,
    error: null,
    result: null,
    allFrames: []
  });

  const generateWithStreaming = useCallback(async (spec: string) => {
    setState(prevState => ({
      ...prevState,
      isRunning: true,
      error: null,
      result: null,
      progress: 0,
      allFrames: []
    }));

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spec }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const phases = ['input', 'rag', 'thinking', 'generation', 'validation'];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const frame: StreamFrame = JSON.parse(line);
              
              setState(prevState => {
                const newState = {
                  ...prevState,
                  allFrames: [...prevState.allFrames, frame]
                };

                // Update state based on frame type
                switch (frame.type) {
                  case 'phase':
                    const phaseIndex = phases.indexOf(frame.phase);
                    const progress = phaseIndex >= 0 ? ((phaseIndex + 1) / phases.length) * 100 : 0;
                    
                    newState.currentPhase = frame.phase;
                    newState.currentMessage = frame.message;
                    newState.attempt = frame.attempt;
                    newState.progress = progress;
                    break;

                  case 'generation':
                    if (!frame.partial) {
                      newState.progress = 90; // Almost complete when generation is done
                    }
                    break;

                  case 'result':
                    newState.progress = 100;
                    newState.isRunning = false;
                    newState.result = frame.data;
                    newState.currentPhase = null;
                    newState.currentMessage = null;
                    
                    if (frame.success) {
                      options.onComplete?.(frame.data);
                    }
                    break;

                  case 'error':
                    newState.progress = 0;
                    newState.isRunning = false;
                    newState.error = frame.message;
                    newState.currentPhase = null;
                    newState.currentMessage = null;
                    
                    options.onError?.(frame.message);
                    break;
                }

                return newState;
              });

              // Call frame callback
              options.onFrame?.(frame);
            } catch (e) {
              console.error('Failed to parse streaming frame:', line, e);
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setState(prevState => ({
        ...prevState,
        isRunning: false,
        error: errorMessage,
        progress: 0,
        currentPhase: null,
        currentMessage: null
      }));
      
      options.onError?.(errorMessage);
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      currentPhase: null,
      currentMessage: null,
      attempt: 0,
      progress: 0,
      error: null,
      result: null,
      allFrames: []
    });
  }, []);

  return {
    ...state,
    generateWithStreaming,
    reset
  };
}