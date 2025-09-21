/**
 * Example integration showing how to use Drafter agent in the existing API
 *
 * This demonstrates how the new Drafter agent could replace the current
 * generation logic in src/app/api/run/route.ts while preserving all
 * existing functionality.
 */

import { runDrafterAgent } from "@/lib/agents";
import type { SpecPack } from "@/lib/spec/types";

/**
 * Example of how Drafter agent integrates with existing workflow
 *
 * This function shows the integration pattern that would replace the
 * current buildContextualMessages + ai.generateWithFallback pattern
 * in the generationLoop.
 */
export async function exampleDrafterIntegration(
  specText: string,
  pack: SpecPack,
  knowledgeContext: string,
  researchContext: string
) {
  console.log("🔄 Using Drafter agent for generation...");

  // NEW: Single call to Drafter agent replaces the multi-step process
  const streamResult = await runDrafterAgent(
    specText,
    pack,
    knowledgeContext,
    researchContext
  );

  console.log("✅ Drafter agent streaming result ready");
  return streamResult;
}

/**
 * Comparison: Current approach vs Drafter agent approach
 */
export function integrationComparison() {
  return {
    current: {
      steps: [
        "1. buildSystemPrompt(pack) - get validation rules",
        "2. buildUserPrompt(specText) - format user input",
        "3. Manually combine with knowledge/research context",
        "4. Create CoreMessage[] array",
        "5. Call ai.generateWithFallback(messages)",
      ],
      files: [
        "src/lib/spec/prompt.ts",
        "src/lib/spec/api/workflowHelpers.ts",
        "src/lib/spec/api/generationLoop.ts",
      ],
    },

    drafter: {
      steps: [
        "1. Call runDrafterAgent(input, pack, knowledge, research)",
        "2. Get streaming result directly",
      ],
      files: [
        "src/lib/agents/drafter.ts (preserves all existing functionality)",
      ],
      advantages: [
        "✅ Preserves existing buildSystemPrompt() integration",
        "✅ Adds rich domain knowledge from master prompt",
        "✅ Simplifies API route logic",
        "✅ Maintains compatibility with validation system",
        "✅ Proper error handling and fallbacks built-in",
      ],
    },
  };
}

/**
 * Migration path for existing API route
 */
export function migrationExample() {
  return `
// BEFORE: In src/app/api/run/route.ts
const messages = buildContextualMessages(
  specText,
  pack, 
  knowledgeContext,
  researchContext
);
const result = await ai.generateWithFallback(messages);

// AFTER: With Drafter agent
const result = await runDrafterAgent(
  specText,
  pack,
  knowledgeContext, 
  researchContext
);

// Same streaming interface, enhanced functionality!
  `;
}

export { exampleDrafterIntegration as default };
