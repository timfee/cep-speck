/**
 * Individual workflow phase implementations
 */

import type { GenerationLoopContext } from "./types";

import {
  createGenerationFrame,
  createPhaseFrame,
  createValidationFrame,
  encodeStreamFrame,
} from "../../spec/streaming";

import type { Issue, ValidationReport } from "../../spec/types";
import { validateAll } from "../../spec/validate";
import { runDrafterAgent } from "../drafter";
import { runSemanticEvaluator } from "../evaluator";
import type { SemanticIssue } from "../evaluator-helpers";
import { runRefinerAgent } from "../refiner";
import { combineAllIssues } from "../semanticIssueConverter";

/**
 * Execute the draft generation phase
 */
export async function executeDraftPhase(
  context: GenerationLoopContext,
  attempt: number,
  totalTokens: number
): Promise<{ draft: string; updatedTokens: number }> {
  sendDraftPhaseNotification(context, attempt);
  const drafterResult = await runDrafterAgent(
    context.specText,
    context.pack,
    context.knowledgeContext,
    context.researchContext
  );
  return await streamDraftContent(context, drafterResult, totalTokens);
}

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

/**
 * Run refinement phase
 */
export async function runRefinement(
  context: GenerationLoopContext,
  attempt: number,
  draft: string,
  allIssues: Issue[],
  totalTokens: number
): Promise<string> {
  sendRefinementPhaseNotification(context, attempt, allIssues);
  const refinerResult = await runRefinerAgent(draft, allIssues);
  return await streamRefinedContent(context, refinerResult, totalTokens);
}

function sendDraftPhaseNotification(
  context: GenerationLoopContext,
  attempt: number
) {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "generating",
        attempt,
        `Drafting content (attempt ${attempt}/${context.maxAttempts})`
      )
    )
  );
}

async function streamDraftContent(
  context: GenerationLoopContext,
  drafterResult: Awaited<ReturnType<typeof runDrafterAgent>>,
  totalTokens: number
): Promise<{ draft: string; updatedTokens: number }> {
  let draftContent = "";
  let updatedTokens = totalTokens;

  for await (const delta of drafterResult.textStream) {
    draftContent += delta;
    context.safeEnqueue(
      encodeStreamFrame(
        createGenerationFrame(delta, draftContent, ++updatedTokens)
      )
    );
  }

  const draft = await drafterResult.text;
  return { draft, updatedTokens };
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

function sendRefinementPhaseNotification(
  context: GenerationLoopContext,
  attempt: number,
  allIssues: Issue[]
) {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "healing",
        attempt,
        `Refining content (${allIssues.length} issues found)`
      )
    )
  );
}

async function streamRefinedContent(
  context: GenerationLoopContext,
  refinerResult: Awaited<ReturnType<typeof runRefinerAgent>>,
  totalTokens: number
): Promise<string> {
  let refinedContent = "";

  for await (const delta of refinerResult.textStream) {
    refinedContent += delta;
    context.safeEnqueue(
      encodeStreamFrame(
        createGenerationFrame(delta, refinedContent, ++totalTokens)
      )
    );
  }

  return await refinerResult.text;
}
