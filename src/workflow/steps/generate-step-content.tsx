import type { Issue } from "@/lib/spec/types";

import { GenerateStepActions } from "./generate-step-actions";
import { GenerateStepStatus } from "./generate-step-status";

interface GenerateStepContentProps {
  isGenerating: boolean;
  phase: string;
  attempt: number;
  progress: number;
  phaseStatus: Record<
    string,
    { attempts: number; issues: number; lastMessage?: string }
  >;
  validationIssues: Issue[];
  error?: string | null;
  generatedPrd: string;
  deterministicIssues: Issue[];
  onGenerate: () => void;
  onRefine: () => void;
  isRefining: boolean;
  onCopy: () => void;
  hasGeneratedPrd: boolean;
  showSuccess: boolean;
  wordCount: number;
  phaseDescription?: string;
}

export function GenerateStepContent({
  isGenerating,
  phase,
  attempt,
  progress,
  phaseStatus,
  validationIssues,
  error,
  generatedPrd,
  deterministicIssues,
  onGenerate,
  onRefine,
  isRefining,
  onCopy,
  hasGeneratedPrd,
  showSuccess,
  wordCount,
  phaseDescription,
}: GenerateStepContentProps) {
  return (
    <>
      <GenerateStepStatus
        isGenerating={isGenerating}
        phase={phase}
        attempt={attempt}
        progress={progress}
        phaseDescription={phaseDescription}
        phaseStatus={phaseStatus}
        validationIssues={validationIssues}
        wordCount={wordCount}
      />

      <GenerateStepActions
        isGenerating={isGenerating}
        deterministicIssues={deterministicIssues}
        onGenerate={onGenerate}
        onRefine={onRefine}
        isRefining={isRefining}
        onCopy={onCopy}
        hasGeneratedPrd={hasGeneratedPrd}
        showSuccess={showSuccess}
        validationIssues={validationIssues}
        error={error}
        generatedPrd={generatedPrd}
      />
    </>
  );
}
