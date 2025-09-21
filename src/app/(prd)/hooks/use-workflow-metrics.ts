import { useMemo } from "react";

import type { WorkflowMetrics } from "@/components/ui/metrics-dashboard";
import type { Issue } from "@/lib/spec/types";

// Constants for workflow timing estimates
const GENERATION_ESTIMATE_SECONDS = 30;
const VALIDATION_ESTIMATE_SECONDS = 10;
const SCORE_PENALTY_PER_ISSUE = 10;

interface UseWorkflowMetricsParams {
  draft: string;
  issues: Issue[];
  attempt: number;
  elapsedTime: number;
  phase: string;
}

/**
 * Custom hook to calculate workflow metrics based on current state
 */
export function useWorkflowMetrics({
  draft,
  issues,
  attempt,
  elapsedTime,
  phase,
}: UseWorkflowMetricsParams): WorkflowMetrics {
  return useMemo(() => {
    const wordCount = draft
      ? draft.split(/\s+/).filter((word) => word.length > 0).length
      : 0;

    const validationScore =
      issues.length === 0
        ? 100
        : Math.max(0, 100 - issues.length * SCORE_PENALTY_PER_ISSUE);

    const iterationAttempts = Math.max(0, attempt - 1);

    const estimatedCompletion =
      phase === "generating"
        ? GENERATION_ESTIMATE_SECONDS
        : phase === "validating"
          ? VALIDATION_ESTIMATE_SECONDS
          : undefined;

    return {
      wordCount,
      validationScore,
      iterationAttempts,
      elapsedTime,
      issuesFound: issues.length,
      phase,
      estimatedCompletion,
    };
  }, [draft, issues, attempt, elapsedTime, phase]);
}
