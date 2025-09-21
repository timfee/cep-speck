import type { CoreMessage, StreamTextResult } from "ai";

import { getResilientAI } from "@/lib/ai/resilient";
import { readKnowledgeDirectory } from "@/lib/knowledge/reader";
import { performCompetitorResearch } from "@/lib/research/web-search";

import type { StructuredOutline } from "./types";
import { loadPrompt } from "./utils";

/**
 * Drafter Agent: Generate full PRD draft with RAG and web search
 */
export async function runDrafterAgent(
  outline: StructuredOutline
): Promise<StreamTextResult<Record<string, never>, never>> {
  try {
    // Load prompt template
    const systemPrompt = await loadPrompt("drafter");

    // Perform RAG - load knowledge base
    let knowledgeContext = "";
    try {
      const knowledgeFiles = await readKnowledgeDirectory("./knowledge");
      if (knowledgeFiles.length > 0) {
        knowledgeContext = `\n\nKnowledge Base Context:\n${knowledgeFiles
          .map((f) => `${f.path}:\n${f.content}`)
          .join("\n\n")}`;
      }
    } catch (error) {
      console.warn("Knowledge base loading failed:", error);
    }

    // Perform web search if competitor analysis is mentioned
    let researchContext = "";
    const outlineText = JSON.stringify(outline);
    const needsCompetitorResearch = /competitor|competition|market/i.test(
      outlineText
    );

    if (needsCompetitorResearch) {
      try {
        // Extract competitor mentions from outline notes
        const competitorMentions = extractCompetitorMentions(outline);
        if (competitorMentions.length > 0) {
          const researchResult = performCompetitorResearch(competitorMentions);
          const competitorData = researchResult.competitors
            .map((comp) => `${comp.vendor}: ${JSON.stringify(comp, null, 2)}`)
            .join("\n\n");
          researchContext = `\n\nCompetitor Research:\n${competitorData}`;
          if (researchResult.autoFilledFacts.length > 0) {
            researchContext += `\n\nAuto-filled Facts: ${researchResult.autoFilledFacts.join(", ")}`;
          }
        }
      } catch (error) {
        console.warn("Web search failed:", error);
      }
    }

    // Build contextual messages
    const fullSystemPrompt = systemPrompt + knowledgeContext + researchContext;
    const messages: CoreMessage[] = [
      { role: "system", content: fullSystemPrompt },
      {
        role: "user",
        content: `Generate a complete PRD based on this outline:\n\n${JSON.stringify(outline, null, 2)}`,
      },
    ];

    // Get AI instance and stream response
    const ai = getResilientAI();
    return await ai.generateWithFallback(messages);
  } catch (error) {
    console.error("Drafter agent failed:", error);
    throw new Error("Failed to generate draft");
  }
}

/**
 * Extract competitor mentions from outline notes
 */
function extractCompetitorMentions(outline: StructuredOutline): string[] {
  const mentions: string[] = [];

  for (const section of outline.sections) {
    if (section.notes) {
      // Look for specific competitor mentions
      const competitorPattern =
        /(?:check|research|analyze)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
      const matches = section.notes.matchAll(competitorPattern);

      for (const match of matches) {
        mentions.push(match[1]);
      }
    }
  }

  return mentions;
}
