import { promises as fs } from "fs";
import path from "path";

import { streamText } from "ai";

import { geminiModel } from "@/lib/ai/provider";

import type { StructuredOutline } from "./outliner";

// Load knowledge base files for RAG
async function loadKnowledgeBase(): Promise<string> {
  try {
    const knowledgeDir = path.join(process.cwd(), "knowledge");
    const files = await fs.readdir(knowledgeDir, { withFileTypes: true });

    const knowledgeContent: string[] = [];

    for (const file of files) {
      if (file.isFile() && file.name.endsWith(".md")) {
        const filePath = path.join(knowledgeDir, file.name);
        const content = await fs.readFile(filePath, "utf-8");
        knowledgeContent.push(`=== ${file.name} ===\n${content}\n`);
      }
    }

    return knowledgeContent.join("\n");
  } catch (error) {
    console.warn("Could not load knowledge base:", error);
    return "";
  }
}

// Load generation flow guide
async function loadGenerationFlowGuide(): Promise<string> {
  try {
    const guidePath = path.join(
      process.cwd(),
      "guides",
      "generation_flow_guide.md"
    );
    return await fs.readFile(guidePath, "utf-8");
  } catch (error) {
    console.warn("Could not load generation flow guide:", error);
    return "Write a comprehensive, detailed PRD based on the provided outline.";
  }
}

export function drafterAgent(
  outline: StructuredOutline
): ReadableStream<Uint8Array> {
  const provider = geminiModel();

  // Create the stream
  return new ReadableStream({
    async start(controller) {
      try {
        const [knowledge, flowGuide] = await Promise.all([
          loadKnowledgeBase(),
          loadGenerationFlowGuide(),
        ]);

        const systemPrompt = `You are an expert Google PM. Write a full, comprehensive, unabridged PRD based only on the provided JSON outline. Follow the section order and user notes precisely. Use a professional, concise, and factual tone.

${flowGuide}

Internal Knowledge Context:
${knowledge}

You have web search capability. If the outline mentions competitors or requires market data, perform searches to find current information and always cite your sources in a 'Footnotes' section.

Write the complete PRD as flowing text. Do not use JSON or structured format in your response - write natural prose.`;

        const userPrompt = `Outline: ${JSON.stringify(outline, null, 2)}`;

        const result = streamText({
          model: provider,
          system: systemPrompt,
          prompt: userPrompt,
        });

        // Stream the response
        const encoder = new TextEncoder();

        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }

        controller.close();
      } catch (error) {
        console.error("Drafter agent failed:", error);
        const encoder = new TextEncoder();
        const errorMessage = `Error generating draft: ${error instanceof Error ? error.message : String(error)}`;
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      }
    },
  });
}
