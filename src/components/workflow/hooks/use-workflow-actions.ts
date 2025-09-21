import { useCallback } from "react";

import type { StructuredOutline } from "@/lib/agents/types";

interface UseWorkflowActionsProps {
  generateOutline: () => Promise<void>;
  generateDraft: () => Promise<void>;
  setBrief: (brief: string) => void;
  setOutline: (outline: StructuredOutline) => void;
  resetWorkflow: () => void;
}

export function useWorkflowActions({
  generateOutline,
  generateDraft,
  setBrief,
  setOutline,
  resetWorkflow,
}: UseWorkflowActionsProps) {
  const handleBriefSubmit = useCallback(async () => {
    try {
      await generateOutline();
    } catch (error) {
      console.error("Failed to generate outline:", error);
    }
  }, [generateOutline]);

  const handleOutlineEdit = useCallback(
    (outline: StructuredOutline) => {
      setOutline(outline);
    },
    [setOutline]
  );

  const handleGenerateDraft = useCallback(async () => {
    try {
      await generateDraft();
    } catch (error) {
      console.error("Failed to generate draft:", error);
    }
  }, [generateDraft]);

  const handleEditBrief = useCallback(() => {
    setBrief("");
  }, [setBrief]);

  return {
    handleBriefSubmit,
    handleOutlineEdit,
    handleGenerateDraft,
    handleEditBrief,
    resetWorkflow,
  };
}
