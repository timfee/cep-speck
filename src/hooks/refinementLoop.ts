import type { EvaluationReport } from "@/lib/agents";

interface RefinementLoopOptions {
  initialDraft: string;
  maxIterations: number;
  evaluate: (draft: string) => Promise<EvaluationReport>;
  refine: (
    draft: string,
    report: EvaluationReport,
    onDraftUpdate: (content: string) => void
  ) => Promise<string>;
  onEvaluating: (iteration: number) => void;
  onNoIssues: () => void;
  onLimitReached: (report: EvaluationReport) => void;
  onRefining: (iteration: number, report: EvaluationReport) => void;
  onDraftUpdate: (content: string) => void;
}

interface RefinementLoopResult {
  draft: string;
  report: EvaluationReport | null;
  iterations: number;
  limitHit: boolean;
}

export async function runAgenticRefinementLoop({
  initialDraft,
  maxIterations,
  evaluate,
  refine,
  onEvaluating,
  onNoIssues,
  onLimitReached,
  onRefining,
  onDraftUpdate,
}: RefinementLoopOptions): Promise<RefinementLoopResult> {
  let currentDraft = initialDraft;
  let currentReport: EvaluationReport | null = null;
  let refinements = 0;
  let limitHit = false;

  let shouldContinue = true;

  while (shouldContinue) {
    onEvaluating(refinements);

    const report = await evaluate(currentDraft);
    currentReport = report;

    if (report.length === 0) {
      onNoIssues();
      shouldContinue = false;
      continue;
    }

    if (refinements >= maxIterations) {
      limitHit = true;
      onLimitReached(report);
      shouldContinue = false;
      continue;
    }

    refinements += 1;
    onRefining(refinements, report);
    currentDraft = await refine(currentDraft, report, onDraftUpdate);
  }

  return {
    draft: currentDraft,
    report: currentReport,
    iterations: refinements,
    limitHit,
  };
}
