import type { CoreMessage } from "ai";

import { getResilientAI } from "@/lib/ai/resilient";

import {
  createGenerationFrame,
  createPhaseFrame,
  createResultFrame,
  createValidationFrame,
  encodeStreamFrame,
} from "../streaming";

import type { SpecPack } from "../types";
import { validateAll } from "../validate";

export interface GenerationLoopContext {
  messages: CoreMessage[];
  pack: SpecPack;
  maxAttempts: number;
  startTime: number;
  safeEnqueue: (frame: Uint8Array) => void;
}

export async function runGenerationLoop(
  context: GenerationLoopContext
): Promise<void> {
  const ai = getResilientAI();
  let attempt = 0;
  let finalDraft = "";
  let totalTokens = 0;

  while (attempt < context.maxAttempts) {
    attempt++;

    // Phase 3: Generate content
    context.safeEnqueue(
      encodeStreamFrame(
        createPhaseFrame(
          "generating",
          attempt,
          `Generating content (attempt ${attempt}/${context.maxAttempts})`
        )
      )
    );

    const result = await ai.generateWithFallback(context.messages);

    let draftContent = "";
    for await (const delta of result.textStream) {
      draftContent += delta;
      context.safeEnqueue(
        encodeStreamFrame(
          createGenerationFrame(delta, draftContent, ++totalTokens)
        )
      );
    }

    const draft = await result.text;
    finalDraft = draft;

    // Phase 4: Validate content
    const validationStartTime = Date.now();
    context.safeEnqueue(
      encodeStreamFrame(
        createPhaseFrame("validating", attempt, "Running validation checks")
      )
    );

    const report = await validateAll(draft, context.pack);
    const validationDuration = Date.now() - validationStartTime;

    context.safeEnqueue(
      encodeStreamFrame(createValidationFrame(report, validationDuration))
    );

    if (report.ok) {
      finalDraft = draft;
      const totalDuration = Date.now() - context.startTime;

      context.safeEnqueue(
        encodeStreamFrame(
          createPhaseFrame("done", attempt, "Content generation complete")
        )
      );
      context.safeEnqueue(
        encodeStreamFrame(
          createResultFrame(true, finalDraft, attempt, totalDuration)
        )
      );
      break;
    }

    // Validation failed - without healing, we complete with validation issues
    finalDraft = draft;
    const totalDuration = Date.now() - context.startTime;
    context.safeEnqueue(
      encodeStreamFrame(
        createPhaseFrame(
          "failed",
          attempt,
          `Validation failed with ${report.issues.length} issues`
        )
      )
    );
    context.safeEnqueue(
      encodeStreamFrame(
        createResultFrame(false, finalDraft, attempt, totalDuration)
      )
    );
    break;
  }
}
