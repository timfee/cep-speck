import { useCallback, useMemo, useState } from "react";

import {
  serializeWorkflowToLegacySpecText,
  serializeWorkflowToSpec,
} from "@/lib/serializers/workflow-to-spec";

import { serializeWorkflowToOutlinePayload } from "@/lib/serializers/workflow-to-structured-outline";
import type { WorkflowStateSetter } from "@/lib/utils/progress-calculation";
// Removed direct import of AI service - this should only run on server side
import { initialWorkflowState } from "@/lib/utils/workflow-initial-state";

import type {
  ContentOutline,
  EnterpriseParameters,
  StructuredWorkflowState,
} from "@/types/workflow";

import { useContentEditing } from "./use-content-editing";
import { useWorkflowNavigation } from "./use-workflow-navigation";
import { useWorkflowStateWithProgress } from "./use-workflow-progress";

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
        // SECURITY FIX: Use API route instead of direct client-side AI access
        const response = await fetch("/api/content-outline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = (await response.json()) as {
          outline: ContentOutline;
          error?: string;
        };
        dispatch.setContentOutline(result.outline);

        // Set error if AI failed but fallback was used
        if (result.error != null && result.error !== "") {
          dispatch.setError(result.error);
        }
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
