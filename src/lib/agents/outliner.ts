import { z } from "zod";

import { getResilientAI } from "@/lib/ai/resilient";

import { loadOutlinerPrompt } from "./promptLoader";
import type { StructuredOutline } from "./types";

const outlineSchema = z.object({
  sections: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        notes: z.string().optional(),
      })
    )
    .min(1),
});

type OutlineSchema = z.infer<typeof outlineSchema>;

export async function runOutlinerAgent(
  brief: string
): Promise<StructuredOutline> {
  const ai = getResilientAI();
  const systemPrompt = await loadOutlinerPrompt();
  const { object } = await ai.generateObjectWithFallback<OutlineSchema>({
    prompt: `${systemPrompt}\n\nUser Brief:\n${brief.trim()}`,
    schema: outlineSchema,
  });

  return {
    sections: object.sections.map((section, index) => ({
      id: section.id.trim().length > 0 ? section.id.trim() : String(index + 1),
      title: section.title.trim(),
      notes: section.notes?.trim() ?? "",
    })),
  };
}
