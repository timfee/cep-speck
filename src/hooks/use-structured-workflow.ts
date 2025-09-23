import { useCallback, useMemo, useState } from "react";

import { serializeWorkflowToSpec } from "@/lib/serializers/workflow-to-spec";
import { generateContentOutlineFromPrompt } from "@/lib/services/content-outline-service";
import type { StructuredWorkflowState } from "@/types/workflow";

import { calculateStepProgress } from "./progress-calculation";
import { useContentEditing } from "./use-content-editing";
import { initialWorkflowState } from "./workflow-initial-state";
import { useWorkflowNavigation } from "./workflow-navigation";
import { useWorkflowSetters } from "./workflow-setters";

export const useStructuredWorkflow = () => {
  const [state, setState] =
    useState<StructuredWorkflowState>(initialWorkflowState);

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

  // Extract different concerns into separate hooks
  const setters = useWorkflowSetters(setState);
  const contentEditing = useContentEditing(setState);
  const navigation = useWorkflowNavigation(
    currentState,
    setState,
    initialWorkflowState
  );

  const generateContentOutlineForPrompt = useCallback(
    async (prompt: string) => {
      setters.setLoading(true);
      setters.setError(undefined);

      try {
        const outline = await generateContentOutlineFromPrompt(prompt);
        setters.setContentOutline(outline);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to generate content outline";
        setters.setError(errorMessage);
        console.error("Content outline generation failed:", error);
      } finally {
        setters.setLoading(false);
      }
    },
    [setters]
  );

  const serializeToSpecTextCallback = useCallback((): string => {
    return serializeWorkflowToSpec(state);
  }, [state]);

  return {
    state: currentState,
    ...setters,
    ...navigation,
    generateContentOutlineForPrompt,
    serializeToSpecText: serializeToSpecTextCallback,
    // Content editing functions from extracted hook
    ...contentEditing,
  };
};
