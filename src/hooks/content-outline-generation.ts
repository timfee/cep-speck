/**
 * Content outline generation for structured workflow
 */

import {
  generateAIContentOutline,
  parseContentOutlineResponse,
} from "@/lib/agents/content-outline-agent";

import type { ContentOutline } from "@/types/workflow";

import {
  generateDLPMilestones,
  generateDLPMetrics,
  generateDLPRequirements,
  generateGenericMilestones,
  generateGenericMetrics,
  generateGenericRequirements,
  generateOnboardingRequirements,
} from "./content-outline-fallback-generators";

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
    return generateFallbackOutline(prompt);
  }
}

/**
 * Generate fallback content outline based on context keywords
 */
function generateFallbackOutline(prompt: string): ContentOutline {
  const contextKeywords = prompt.toLowerCase();

  // Determine content type and generate appropriate fallback
  if (
    contextKeywords.includes("dlp") ||
    contextKeywords.includes("data loss")
  ) {
    return {
      functionalRequirements: generateDLPRequirements(),
      successMetrics: generateDLPMetrics(),
      milestones: generateDLPMilestones(),
    };
  }

  if (
    contextKeywords.includes("onboard") ||
    contextKeywords.includes("nudge")
  ) {
    return {
      functionalRequirements: generateOnboardingRequirements(),
      successMetrics: generateGenericMetrics(),
      milestones: generateGenericMilestones(),
    };
  }

  // Generic fallback
  return {
    functionalRequirements: generateGenericRequirements(prompt),
    successMetrics: generateGenericMetrics(),
    milestones: generateGenericMilestones(),
  };
}
