/**
 * Hybrid Drafter→Linter→Evaluator→Refiner workflow implementation
 *
 * This implements the complete hybrid agentic workflow orchestrating:
 * - Drafter: AI generation with mega-prompt + existing toPrompt functions
 * - Linter: Existing deterministic validate functions
 * - Evaluator: AI semantic analysis
 * - Refiner: AI healing replacement
 */

import { runDrafterAgent } from "./drafter";
import { runSemanticEvaluator } from "./evaluator";
import { runRefinerAgent } from "./refiner";
import { combineAllIssues } from "./semanticIssueConverter";

import {
  createGenerationFrame,
  createPhaseFrame,
  createResultFrame,
  createValidationFrame,
  encodeStreamFrame,
} from "../spec/streaming";

import type { Issue, SpecPack } from "../spec/types";
import { validateAll } from "../spec/validate";

export interface GenerationLoopContext {
  /** User input specification text */
  specText: string;
  /** Knowledge base context */
  knowledgeContext: string;
  /** Research context */
  researchContext: string;
  /** SpecPack configuration */
  pack: SpecPack;
  /** Maximum retry attempts */
  maxAttempts: number;
  /** Workflow start time */
  startTime: number;
  /** Stream frame enqueue function */
  safeEnqueue: (frame: Uint8Array) => void;
}

/**
 * Run the hybrid Drafter→Linter→Evaluator→Refiner workflow
 *
 * Orchestrates all four phases of the hybrid workflow:
 * 1. **Draft Phase**: Uses Drafter agent with mega-prompt + existing toPrompt integration
 * 2. **Linter Phase**: Uses existing validateAll for deterministic validation
 * 3. **Evaluator Phase**: Uses Semantic Evaluator for AI-powered quality analysis
 * 4. **Refiner Phase**: Uses Refiner agent for AI-powered healing if issues found
 *
 * The workflow continues until validation passes or max attempts are reached.
 * Preserves existing validation architecture while adding sophisticated AI capabilities.
 *
 * @param context - Generation loop context with spec, knowledge, research, and config
 */
export async function runGenerationLoop(
  context: GenerationLoopContext
): Promise<void> {
  let attempt = 0;
  let finalDraft = "";
  let totalTokens = 0;

  while (attempt < context.maxAttempts) {
    attempt++;

    try {
      const result = await runSingleAttempt(context, attempt, totalTokens);
      finalDraft = result.draft;
      totalTokens = result.totalTokens;

      if (result.shouldContinue) {
        continue;
      } else {
        break;
      }
    } catch (error) {
      handleWorkflowError(context, attempt, finalDraft, error);
      break;
    }
  }
}

/**
 * Run a single attempt of the workflow
 */
async function runSingleAttempt(
  context: GenerationLoopContext,
  attempt: number,
  totalTokens: number
): Promise<{ draft: string; totalTokens: number; shouldContinue: boolean }> {
  // **Phase 1: Draft** - Use Drafter agent (preserves toPrompt integration)
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "generating",
        attempt,
        `Drafting content (attempt ${attempt}/${context.maxAttempts})`
      )
    )
  );

  const drafterResult = await runDrafterAgent(
    context.specText,
    context.pack,
    context.knowledgeContext,
    context.researchContext
  );

  let draftContent = "";
  for await (const delta of drafterResult.textStream) {
    draftContent += delta;
    context.safeEnqueue(
      encodeStreamFrame(
        createGenerationFrame(delta, draftContent, ++totalTokens)
      )
    );
  }

  const draft = await drafterResult.text;

  // **Phase 2 & 3: Validate and Evaluate**
  const { allIssues, unifiedReport } = await runValidationAndEvaluation(
    context,
    attempt,
    draft
  );

  // Check if validation passed
  if (unifiedReport.ok) {
    finishSuccessfully(context, attempt, draft);
    return { draft, totalTokens, shouldContinue: false };
  }

  // **Phase 5: Refiner** - Use Refiner agent if any issues found
  if (attempt < context.maxAttempts) {
    const refinedDraft = await runRefinement(
      context,
      attempt,
      draft,
      allIssues,
      totalTokens
    );
    return { draft: refinedDraft, totalTokens, shouldContinue: true };
  } else {
    finishWithFailure(context, attempt, draft, allIssues);
    return { draft, totalTokens, shouldContinue: false };
  }
}

/**
 * Run validation and evaluation phases
 */
async function runValidationAndEvaluation(
  context: GenerationLoopContext,
  attempt: number,
  draft: string
) {
  // **Phase 2: Linter** - Use existing validateAll (preserves validate functions)
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

  // **Phase 3: Evaluator** - Use Semantic Evaluator for AI quality analysis
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("evaluating", attempt, "Running semantic evaluation")
    )
  );

  const semanticIssues = await runSemanticEvaluator(draft);

  // **Phase 4: Combine Issues** - Convert SemanticIssue[] to Issue[] format
  const allIssues = combineAllIssues(
    deterministicReport.issues,
    semanticIssues
  );

  // Create unified validation report for streaming
  const unifiedReport = {
    ok: allIssues.length === 0,
    issues: allIssues,
    coverage: deterministicReport.coverage,
  };

  context.safeEnqueue(
    encodeStreamFrame(createValidationFrame(unifiedReport, validationDuration))
  );

  return { allIssues, unifiedReport };
}

/**
 * Run refinement phase
 */
async function runRefinement(
  context: GenerationLoopContext,
  attempt: number,
  draft: string,
  allIssues: Issue[],
  totalTokens: number
): Promise<string> {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "healing",
        attempt,
        `Refining content (${allIssues.length} issues found)`
      )
    )
  );

  const refinerResult = await runRefinerAgent(draft, allIssues);

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

/**
 * Finish workflow successfully
 */
function finishSuccessfully(
  context: GenerationLoopContext,
  attempt: number,
  draft: string
) {
  const totalDuration = Date.now() - context.startTime;

  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("done", attempt, "Content generation complete")
    )
  );
  context.safeEnqueue(
    encodeStreamFrame(createResultFrame(true, draft, attempt, totalDuration))
  );
}

/**
 * Finish workflow with failure
 */
function finishWithFailure(
  context: GenerationLoopContext,
  attempt: number,
  draft: string,
  allIssues: Issue[]
) {
  const totalDuration = Date.now() - context.startTime;

  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame(
        "failed",
        attempt,
        `Validation failed with ${allIssues.length} issues`
      )
    )
  );
  context.safeEnqueue(
    encodeStreamFrame(createResultFrame(false, draft, attempt, totalDuration))
  );
}

/**
 * Handle workflow errors gracefully
 */
function handleWorkflowError(
  context: GenerationLoopContext,
  attempt: number,
  finalDraft: string,
  error: unknown
) {
  const totalDuration = Date.now() - context.startTime;
  const errorMessage = error instanceof Error ? error.message : String(error);

  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("failed", attempt, `Workflow error: ${errorMessage}`)
    )
  );
  context.safeEnqueue(
    encodeStreamFrame(
      createResultFrame(false, finalDraft || "", attempt, totalDuration)
    )
  );
}
