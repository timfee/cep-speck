/**
 * Unified content outline service that fixes the Stream/String mismatch
 * Addresses BLOCKER 1: Content Outline Generation Disconnect
 */

import { getResilientAI } from "@/lib/ai/resilient";
import type { ContentOutline } from "@/types/workflow";

import { buildFallbackOutline } from "./content-outline-fallback";
import { ContentOutlineSchema } from "./content-outline-schemas";

/**
 * Generate content outline from prompt using AI with proper async handling
 */
export async function generateContentOutlineFromPrompt(
  prompt: string
): Promise<{ outline: ContentOutline; error?: string }> {
  const ai = getResilientAI();

  try {
    const result = await ai.generateObjectWithFallback({
      prompt: `Analyze this product idea and generate a content outline:\n${prompt}`,
      schema: ContentOutlineSchema,
    });

    return { outline: result.object };
  } catch (error) {
    console.error("Failed to generate AI content outline:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Return fallback outline with error information
    return {
      outline: buildFallbackOutline(prompt),
      error: errorMessage,
    };
  }
}
