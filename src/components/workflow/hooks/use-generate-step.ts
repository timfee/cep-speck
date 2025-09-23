import { useCallback, useMemo } from "react";

import { useClipboard } from "@/hooks/use-clipboard";
import { getPhaseDescription } from "@/lib/streaming/stream-processor";
import type { StructuredWorkflowState } from "@/types/workflow";

import { useDeterministicIssues } from "./prd-generation-context";
import { usePrdGeneration } from "./use-prd-generation";
import { useRefineDraft } from "./use-refine-draft";

interface UseGenerateStepParams {
  workflowState: StructuredWorkflowState;
  onComplete: (draft: string) => void;
}

export function useGenerateStep({
  workflowState,
  onComplete,
}: UseGenerateStepParams) {
  const generation = usePrdGeneration(onComplete);
  const deterministicIssues = useDeterministicIssues();
  const { copy: copyToClipboardApi } = useClipboard();
  const { refine, isRefining } = useRefineDraft({
    generatedPrd: generation.generatedPrd,
    deterministicIssues,
    applyRefinedDraft: generation.applyRefinedDraft,
    setGenerationError: generation.setGenerationError,
    clearGenerationError: generation.clearGenerationError,
  });

  const { generatePrd } = generation;
  const handleGenerate = useCallback(
    () => generatePrd(workflowState),
    [generatePrd, workflowState]
  );

  const copyToClipboard = useCallback(async () => {
    const content = generation.generatedPrd;
    if (content.length === 0) {
      return;
    }
    await copyToClipboardApi(content);
  }, [copyToClipboardApi, generation.generatedPrd]);

  const hasGeneratedPrd = generation.generatedPrd.length > 0;
  const wordCount = useMemo(() => {
    if (!hasGeneratedPrd) return 0;
    return generation.generatedPrd.trim().split(/\s+/).length;
  }, [generation.generatedPrd, hasGeneratedPrd]);

  const hasError =
    typeof generation.error === "string" && generation.error.length > 0;
  const showSuccess = hasGeneratedPrd && !generation.isGenerating && !hasError;

  return {
    generation,
    deterministicIssues,
    handleGenerate,
    handleRefine: refine,
    isRefining,
    copyToClipboard,
    hasGeneratedPrd,
    showSuccess,
    wordCount,
    phaseDescription: getPhaseDescription(generation.phase),
  } as const;
}
