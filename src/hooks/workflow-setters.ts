import { useCallback } from "react";

import type {
  ContentOutline,
  EnterpriseParameters,
  StructuredWorkflowState,
} from "@/types/workflow";

/**
 * Simple state setters for the workflow
 */
export function useWorkflowSetters(
  setState: (
    updater: (prev: StructuredWorkflowState) => StructuredWorkflowState
  ) => void
) {
  const setInitialPrompt = useCallback(
    (prompt: string) => {
      setState((prev) => ({ ...prev, initialPrompt: prompt }));
    },
    [setState]
  );

  const setContentOutline = useCallback(
    (outline: ContentOutline) => {
      setState((prev) => ({ ...prev, contentOutline: outline }));
    },
    [setState]
  );

  const setEnterpriseParameters = useCallback(
    (parameters: EnterpriseParameters) => {
      setState((prev) => ({ ...prev, enterpriseParameters: parameters }));
    },
    [setState]
  );

  const setSelectedSections = useCallback(
    (sectionIds: string[]) => {
      setState((prev) => ({
        ...prev,
        selectedSections: sectionIds,
        sectionOrder: sectionIds,
      }));
    },
    [setState]
  );

  const updateSectionContent = useCallback(
    (sectionId: string, content: string) => {
      setState((prev) => ({
        ...prev,
        sectionContents: {
          ...prev.sectionContents,
          [sectionId]: content,
        },
      }));
    },
    [setState]
  );

  const reorderSections = useCallback(
    (newOrder: string[]) => {
      setState((prev) => ({ ...prev, sectionOrder: newOrder }));
    },
    [setState]
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      setState((prev) => ({ ...prev, isLoading: loading }));
    },
    [setState]
  );

  const setError = useCallback(
    (error?: string) => {
      setState((prev) => ({ ...prev, error }));
    },
    [setState]
  );

  const setFinalPrd = useCallback(
    (prd: string) => {
      setState((prev) => ({ ...prev, finalPrd: prd }));
    },
    [setState]
  );

  return {
    setInitialPrompt,
    setContentOutline,
    setEnterpriseParameters,
    setSelectedSections,
    updateSectionContent,
    reorderSections,
    setLoading,
    setError,
    setFinalPrd,
  };
}
