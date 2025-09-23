import { MetricsDashboard } from "@/components/ui/metrics-dashboard";
import type { Issue } from "@/lib/spec/types";

import {
  GenerationStatusCard,
  ValidationIssuesAlert,
} from "./generate-step-sections";

interface GenerateStepStatusProps {
  isGenerating: boolean;
  phase: string;
  attempt: number;
  progress: number;
  phaseDescription?: string;
  phaseStatus: Record<
    string,
    { attempts: number; issues: number; lastMessage?: string }
  >;
  validationIssues: Issue[];
  wordCount: number;
}

export function GenerateStepStatus({
  isGenerating,
  phase,
  attempt,
  progress,
  phaseDescription,
  phaseStatus,
  validationIssues,
  wordCount,
}: GenerateStepStatusProps) {
  return (
    <>
      <GenerationStatusCard
        isGenerating={isGenerating}
        phase={phase}
        attempt={attempt}
        progress={progress}
        phaseDescription={phaseDescription ?? ""}
      />

      <MetricsDashboard
        wordCount={wordCount}
        phase={phase}
        phaseStatus={phaseStatus}
        streaming={isGenerating}
      />

      <ValidationIssuesAlert issues={validationIssues} />
    </>
  );
}
