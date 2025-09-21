/**
 * Validation phase implementation
 */

import {
  createPhaseFrame,
  createValidationFrame,
  encodeStreamFrame,
} from "../../spec/streaming";

import type { ValidationReport } from "../../spec/types";
import { validateAll } from "../../spec/validate";
import { runSemanticEvaluator } from "../evaluator";
import type { SemanticIssue } from "../evaluator-helpers";
import { combineAllIssues } from "../semantic-issue-converter";
import type { GenerationLoopContext } from "./types";

/**
 * Run validation and evaluation phases
 */
export async function runValidationAndEvaluation(
  context: GenerationLoopContext,
  attempt: number,
  draft: string
) {
  const deterministicResult = await runDeterministicValidation(
    context,
    attempt,
    draft
  );
  const semanticIssues = await runSemanticValidationPhase(
    context,
    attempt,
    draft
  );
  return buildUnifiedValidationResult(
    deterministicResult,
    semanticIssues,
    context
  );
}

async function runDeterministicValidation(
  context: GenerationLoopContext,
  attempt: number,
  draft: string
): Promise<{ report: ValidationReport; duration: number }> {
  const validationStartTime = Date.now();
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "validating",
        attempt,
        "Running deterministic validation"
      )
    )
  );

  const deterministicReport = await validateAll(draft, context.pack);
  const validationDuration = Date.now() - validationStartTime;

  return { report: deterministicReport, duration: validationDuration };
}

async function runSemanticValidationPhase(
  context: GenerationLoopContext,
  attempt: number,
  draft: string
): Promise<SemanticIssue[]> {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("evaluating", attempt, "Running semantic evaluation")
    )
  );

  return await runSemanticEvaluator(draft);
}

function buildUnifiedValidationResult(
  deterministicResult: { report: ValidationReport; duration: number },
  semanticIssues: SemanticIssue[],
  context: GenerationLoopContext
) {
  const allIssues = combineAllIssues(
    deterministicResult.report.issues,
    semanticIssues
  );

  const unifiedReport = {
    ok: allIssues.length === 0,
    issues: allIssues,
    coverage: deterministicResult.report.coverage,
  };

  context.safeEnqueue(
    encodeStreamFrame(
      createValidationFrame(unifiedReport, deterministicResult.duration)
    )
  );

  return { allIssues, unifiedReport };
}
