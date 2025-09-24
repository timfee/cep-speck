import type { Issue } from "@/lib/spec/types";

import { DeterministicIssuesPanel } from "./deterministic-issues-panel";
import { GenerateActions } from "./generate-actions";
import { ErrorAlert, SuccessAlert } from "./generation-feedback-alerts";
import { PrdPreview } from "./prd-preview";

interface GenerateStepActionsProps {
  isGenerating: boolean;
  deterministicIssues: Issue[];
  onGenerate: () => void;
  onRefine: () => void;
  isRefining: boolean;
  onCopy: () => void;
  hasGeneratedPrd: boolean;
  showSuccess: boolean;
  validationIssues: Issue[];
  error?: string | null;
  generatedPrd: string;
}

export function GenerateStepActions({
  isGenerating,
  deterministicIssues,
  onGenerate,
  onRefine,
  isRefining,
  onCopy,
  hasGeneratedPrd,
  showSuccess,
  validationIssues,
  error,
  generatedPrd,
}: GenerateStepActionsProps) {
  const hasValidationIssues = validationIssues.length > 0;

  return (
    <>
      <DeterministicIssuesPanel
        issues={deterministicIssues}
        onRetry={onGenerate}
        onRefine={onRefine}
        isRefining={isRefining}
        isGenerating={isGenerating}
      />

      <ErrorAlert message={error ?? null} />

      <SuccessAlert
        shouldShow={showSuccess}
        hasValidationIssues={hasValidationIssues}
      />

      <GenerateActions
        showGenerate={!isGenerating && !hasGeneratedPrd}
        showRegenerate={!isGenerating && hasGeneratedPrd}
        onGenerate={onGenerate}
      />

      <PrdPreview content={generatedPrd} onCopy={onCopy} />
    </>
  );
}
