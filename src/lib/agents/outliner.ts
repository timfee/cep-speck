import { z } from "zod";

import { getResilientAI } from "@/lib/ai/resilient";

import type { StructuredOutline } from "./types";
import { loadPrompt } from "./utils";

// Zod schema for structured outline validation
const OutlineSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string(),
});

const StructuredOutlineSchema = z.object({
  sections: z.array(OutlineSectionSchema),
});

/**
 * Outliner Agent: Convert unstructured brief into structured PRD outline
 */
export async function runOutlinerAgent(
  brief: string
): Promise<StructuredOutline> {
  try {
    // Load prompt template
    const systemPrompt = await loadPrompt("outliner");

    // Get AI instance
    const ai = getResilientAI();

    // Generate structured outline using generateObject for JSON output
    const result = await ai.generateObjectWithFallback({
      prompt: `${systemPrompt}\n\nUser Brief: ${brief}`,
      schema: StructuredOutlineSchema,
    });

    return result.object;
  } catch (error) {
    console.error("Outliner agent failed:", error);
    throw new Error("Failed to generate outline");
  }
}
