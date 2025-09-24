import type { Issue } from "@/lib/spec/types";

import { GenerateStepContent } from "./generate-step-content";
import { GenerateStepHeader } from "./generate-step-header";

interface GenerationSnapshot {
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
}

interface GenerateStepViewProps {
  generation: GenerationSnapshot;
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

export function GenerateStepView({
  generation,
  deterministicIssues,
  onGenerate,
  onRefine,
  isRefining,
  onCopy,
  hasGeneratedPrd,
  showSuccess,
  wordCount,
  phaseDescription,
}: GenerateStepViewProps) {
  const {
    isGenerating,
    phase,
    attempt,
    progress,
    phaseStatus,
    validationIssues,
    error,
    generatedPrd,
  } = generation;

  return (
    <div className="space-y-6">
      <GenerateStepHeader />

      <GenerateStepContent
        isGenerating={isGenerating}
        phase={phase}
        attempt={attempt}
        progress={progress}
        phaseStatus={phaseStatus}
        validationIssues={validationIssues}
        error={error}
        generatedPrd={generatedPrd}
        deterministicIssues={deterministicIssues}
        onGenerate={onGenerate}
        onRefine={onRefine}
        isRefining={isRefining}
        onCopy={onCopy}
        hasGeneratedPrd={hasGeneratedPrd}
        showSuccess={showSuccess}
        wordCount={wordCount}
        phaseDescription={phaseDescription}
      />
    </div>
  );
}
