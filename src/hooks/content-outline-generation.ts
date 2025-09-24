/**
 * Content outline generation for structured workflow
 */

import {
  generateAIContentOutline,
  parseContentOutlineResponse,
} from "@/lib/agents/content-outline-agent";

import { buildFallbackOutline } from "@/lib/services/content-outline-fallback";
import type { ContentOutline } from "@/types/workflow";

/**
 * Generate complete content outline using AI
 */
export async function generateContentOutline(
  prompt: string
): Promise<ContentOutline> {
  try {
    const aiResult = await generateAIContentOutline(prompt);
    const fullResponse = await aiResult.text;
    const outline = parseContentOutlineResponse(fullResponse);

    // Validate that we got actual content, not empty arrays
    if (
      outline.functionalRequirements.length === 0 &&
      outline.successMetrics.length === 0 &&
      outline.milestones.length === 0
    ) {
      throw new Error("AI response contained no valid content");
    }

    return outline;
  } catch (error) {
    console.error("Failed to generate AI content outline:", error);

    // Return a context-aware fallback outline
    return buildFallbackOutline(prompt);
  }
}
