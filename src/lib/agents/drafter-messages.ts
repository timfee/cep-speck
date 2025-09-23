/**
 * Message building utilities for the Drafter agent
 */

import type { CoreMessage } from "ai";

import { loadPrompt } from "./prompt-loader";
import type { AgentContext, DrafterConfig } from "./types";
import { buildSystemPrompt, buildUserPrompt } from "../spec/prompt";

/**
 * Build the complete message array for AI generation
 *
 * Combines:
 * 1. Master prompt from guides/prompts/drafter-master.md
 * 2. Existing validation rules via buildSystemPrompt()
 * 3. Optional knowledge and research context
 * 4. User input as user message
 *
 * @param context - Agent execution context
 * @param config - Drafter configuration
 * @param fallbackPrompt - Fallback prompt to use if file loading fails
 * @returns Array of core messages for AI generation
 */
export async function buildDrafterMessages(
  context: AgentContext,
  config: DrafterConfig,
  fallbackPrompt: string
): Promise<CoreMessage[]> {
  const {
    userInput,
    structuredSpec,
    outlinePayload,
    pack,
    knowledgeContext,
    researchContext,
  } = context;

  // Load master prompt
  const masterPrompt = await loadPrompt({
    path: config.masterPromptPath,
    cache: true,
    fallback: fallbackPrompt,
  });

  // Build system prompt with validation rules
  const validationRules = buildSystemPrompt(pack);
  let systemPrompt =
    masterPrompt +
    "\n\n## Validation Requirements\n\n" +
    "The following validation rules MUST be followed:\n\n" +
    validationRules;

  // Add optional contexts
  if (shouldIncludeContext(config.includeKnowledge, knowledgeContext)) {
    systemPrompt += knowledgeContext;
  }
  if (shouldIncludeContext(config.includeResearch, researchContext)) {
    systemPrompt += researchContext;
  }

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: buildUserPrompt({
        specText: userInput,
        structuredSpec,
        outlinePayload,
      }),
    },
  ];
}

/**
 * Helper function to determine if context should be included
 */
function shouldIncludeContext(
  enabled: boolean,
  context: string | undefined
): boolean {
  return enabled && context !== undefined && context.length > 0;
}
