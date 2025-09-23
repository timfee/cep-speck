import { useCallback, useState } from "react";

import { requestDraftRefinement } from "@/lib/services/refine-client";
import type { Issue } from "@/lib/spec/types";

interface UseRefineDraftParams {
  generatedPrd: string;
  deterministicIssues: Issue[];
  applyRefinedDraft: (draft: string) => void;
  setGenerationError: (message: string) => void;
  clearGenerationError: () => void;
}

export function useRefineDraft({
  generatedPrd,
  deterministicIssues,
  applyRefinedDraft,
  setGenerationError,
  clearGenerationError,
}: UseRefineDraftParams) {
  const [isRefining, setIsRefining] = useState(false);

  const refine = useCallback(async () => {
    if (!generatedPrd || deterministicIssues.length === 0) {
      return;
    }

    setIsRefining(true);
    clearGenerationError();

    try {
      const refinedContent = await requestDraftRefinement({
        draft: generatedPrd,
        issues: deterministicIssues,
      });
      applyRefinedDraft(refinedContent);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to refine draft";
      setGenerationError(message);
    } finally {
      setIsRefining(false);
    }
  }, [
    applyRefinedDraft,
    clearGenerationError,
    deterministicIssues,
    generatedPrd,
    setGenerationError,
  ]);

  return { refine, isRefining } as const;
}
