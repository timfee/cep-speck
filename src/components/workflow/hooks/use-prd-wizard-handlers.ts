import React from "react";

import {
  processStreamingResponse,
  useGenerationState,
} from "@/components/workflow/hooks/use-generation-state";

import { useStructuredWorkflow } from "@/hooks/use-structured-workflow";

/**
 * Hook to manage PRD wizard handlers and auto-generation logic
 */
export function usePrdWizardHandlers() {
  const {
    generatedPrd,
    isGenerating,
    error,
    setGeneratedPrd,
    setIsGenerating,
    setError,
  } = useGenerationState();

  const {
    state,
    generateContentOutlineForPrompt,
    serializeToSpecText,
    goToNextStep,
  } = useStructuredWorkflow();

  // Track generation attempts to prevent infinite loops
  const [generationAttempted, setGenerationAttempted] = React.useState<
    Set<string>
  >(new Set());

  const handleRegenerateOutline = React.useCallback(async () => {
    // Clear the generation attempt tracking when manually regenerating
    setGenerationAttempted(new Set());
    await generateContentOutlineForPrompt(state.initialPrompt);
  }, [generateContentOutlineForPrompt, state.initialPrompt]);

  const handleGeneratePrd = React.useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const specText = serializeToSpecText();
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PRD: ${response.statusText}`);
      }

      await processStreamingResponse(
        response,
        setGeneratedPrd,
        setGeneratedPrd
      );

      goToNextStep();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PRD");
    } finally {
      setIsGenerating(false);
    }
  }, [
    setIsGenerating,
    setError,
    serializeToSpecText,
    setGeneratedPrd,
    goToNextStep,
  ]);

  return {
    // State
    generatedPrd,
    isGenerating,
    error,
    generationAttempted,
    setGenerationAttempted,
    // Handlers
    handleRegenerateOutline,
    handleGeneratePrd,
  };
}
