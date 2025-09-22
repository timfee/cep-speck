import React from "react";

import { MIN_PROMPT_LENGTH } from "@/hooks/progress-calculation";
import { useStructuredWorkflowContext } from "@/contexts/structured-workflow-context";

/**
 * Hook to manage auto-generation of content outline
 */
export function useAutoGeneration(
  generationAttempted: Set<string>,
  setGenerationAttempted: React.Dispatch<React.SetStateAction<Set<string>>>
) {
  const { state, generateContentOutlineForPrompt } = useStructuredWorkflowContext();

  // Auto-generate content outline when prompt is ready and we're on outline step
  React.useEffect(() => {
    async function autoGenerateOutline() {
      const promptKey = `${state.currentStep}-${state.initialPrompt}`;

      // Prevent infinite loops by tracking generation attempts
      if (generationAttempted.has(promptKey)) {
        return;
      }

      try {
        setGenerationAttempted((prev) => new Set(prev).add(promptKey));
        await generateContentOutlineForPrompt(state.initialPrompt);
      } catch (error) {
        console.error("Failed to auto-generate content outline:", error);
      }
    }

    if (
      state.currentStep === "outline" &&
      state.initialPrompt.trim().length > MIN_PROMPT_LENGTH &&
      state.contentOutline.functionalRequirements.length === 0 &&
      !state.isLoading
    ) {
      // Handle promise without await (since this is inside useEffect callback)
      // eslint-disable-next-line promise/prefer-await-to-then
      autoGenerateOutline().catch((error) => {
        console.error("Auto-generation failed:", error);
      });
    }
  }, [
    state.currentStep,
    state.initialPrompt,
    state.contentOutline.functionalRequirements.length,
    state.isLoading,
    generateContentOutlineForPrompt,
    generationAttempted,
    setGenerationAttempted,
  ]);
}
