import { useCallback, useMemo, useState } from "react";

import {
  serializeWorkflowToLegacySpecText,
  serializeWorkflowToSpec,
} from "@/lib/serializers/workflow-to-spec";

import { serializeWorkflowToOutlinePayload } from "@/lib/serializers/workflow-to-structured-outline";
import { generateContentOutlineFromPrompt } from "@/lib/services/content-outline-service";

import type {
  ContentOutline,
  EnterpriseParameters,
  StructuredWorkflowState,
} from "@/types/workflow";

import { useContentEditing } from "./use-content-editing";
import { useWorkflowStateWithProgress } from "./use-workflow-progress";
import { initialWorkflowState } from "./workflow-initial-state";
import { useWorkflowNavigation } from "./workflow-navigation";
import type { WorkflowStateSetter } from "./workflow-state";

export interface WorkflowDispatch {
  setInitialPrompt: (prompt: string) => void;
  setContentOutline: (outline: ContentOutline) => void;
  setEnterpriseParameters: (parameters: EnterpriseParameters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setFinalPrd: (prd: string) => void;
}

function createWorkflowDispatch(
  setState: WorkflowStateSetter
): WorkflowDispatch {
  return {
    setInitialPrompt: (prompt: string) => {
      setState((prev) => ({ ...prev, initialPrompt: prompt }));
    },
    setContentOutline: (outline: ContentOutline) => {
      setState((prev) => ({ ...prev, contentOutline: outline }));
    },
    setEnterpriseParameters: (parameters: EnterpriseParameters) => {
      setState((prev) => ({ ...prev, enterpriseParameters: parameters }));
    },
    setLoading: (loading: boolean) => {
      setState((prev) => ({ ...prev, isLoading: loading }));
    },
    setError: (error?: string) => {
      setState((prev) => ({ ...prev, error }));
    },
    setFinalPrd: (prd: string) => {
      setState((prev) => ({ ...prev, finalPrd: prd }));
    },
  };
}

export const useStructuredWorkflow = () => {
  const [state, setState] =
    useState<StructuredWorkflowState>(initialWorkflowState);

  const currentState = useWorkflowStateWithProgress(state);
  const dispatch = useMemo(() => createWorkflowDispatch(setState), [setState]);
  const contentEditing = useContentEditing(setState);
  const navigation = useWorkflowNavigation(
    currentState,
    setState,
    initialWorkflowState
  );

  const getOutlineErrorMessage = useCallback((error: unknown) => {
    return error instanceof Error
      ? error.message
      : "Failed to generate content outline";
  }, []);

  const generateContentOutlineForPrompt = useCallback(
    async (prompt: string) => {
      dispatch.setLoading(true);
      dispatch.setError(undefined);

      try {
        const outline = await generateContentOutlineFromPrompt(prompt);
        dispatch.setContentOutline(outline);
      } catch (error) {
        dispatch.setError(getOutlineErrorMessage(error));
        console.error("Content outline generation failed:", error);
      } finally {
        dispatch.setLoading(false);
      }
    },
    [dispatch, getOutlineErrorMessage]
  );

  const serializeToSpecPayload = useCallback(() => {
    return serializeWorkflowToSpec(state);
  }, [state]);

  const serializeToLegacySpecText = useCallback((): string => {
    return serializeWorkflowToLegacySpecText(state);
  }, [state]);

  const serializeToOutlinePayload = useCallback(() => {
    return serializeWorkflowToOutlinePayload(state);
  }, [state]);

  return {
    state: currentState,
    dispatch,
    navigation,
    ...contentEditing,
    generateContentOutlineForPrompt,
    serializeToSpecPayload,
    serializeToLegacySpecText,
    serializeToOutlinePayload,
  };
};

export type StructuredWorkflowContextValue = ReturnType<
  typeof useStructuredWorkflow
>;
