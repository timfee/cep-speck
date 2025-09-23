import { useState } from "react";

import type { StructuredWorkflowState } from "@/types/workflow";

import { useContentEditing } from "./use-content-editing";
import { useOutlineGeneration } from "./use-outline-generation";
import { useWorkflowStateWithProgress } from "./use-workflow-progress";
import { useWorkflowSerializers } from "./use-workflow-serializers";
import { initialWorkflowState } from "./workflow-initial-state";
import { useWorkflowNavigation } from "./workflow-navigation";
import { useWorkflowSetters } from "./workflow-setters";

export const useStructuredWorkflow = () => {
  const [state, setState] =
    useState<StructuredWorkflowState>(initialWorkflowState);

  const currentState = useWorkflowStateWithProgress(state);
  const setters = useWorkflowSetters(setState);
  const contentEditing = useContentEditing(setState);
  const navigation = useWorkflowNavigation(
    currentState,
    setState,
    initialWorkflowState
  );
  const generateContentOutlineForPrompt = useOutlineGeneration(setters);

  const {
    serializeToSpecPayload,
    serializeToLegacySpecText,
    serializeToOutlinePayload,
  } = useWorkflowSerializers(state);

  return {
    state: currentState,
    ...setters,
    ...navigation,
    generateContentOutlineForPrompt,
    serializeToSpecPayload,
    serializeToLegacySpecText,
    serializeToOutlinePayload,
    // Content editing functions from extracted hook
    ...contentEditing,
  };
};
