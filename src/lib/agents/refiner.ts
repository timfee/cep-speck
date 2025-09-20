import { streamText } from "ai";

import { geminiModel } from "@/lib/ai/provider";

import type { EvaluationReport } from "./evaluator";

export function refinerAgent(
  draft: string,
  report: EvaluationReport
): ReadableStream<Uint8Array> {
  const provider = geminiModel();

  // Create the stream
  return new ReadableStream({
    async start(controller) {
      try {
        const systemPrompt = `You are an expert technical editor. Your task is to rewrite the provided PRD draft to fix all the issues listed in the JSON evaluation report. Do not add new sections. Do not change content that is not related to an issue. Produce a new, complete, and corrected version of the entire document.

Guidelines:
- Fix each issue precisely as described in the evaluation report
- Maintain the original structure and flow of the document
- Only modify content that addresses the specific issues raised
- Preserve all good content that doesn't need changes
- Output the complete corrected document, not just the changed parts

Write the complete corrected PRD as flowing text. Do not use JSON or structured format in your response - write natural prose.`;

        const userPrompt = `Full Draft:

${draft}

Issues to Fix:

${JSON.stringify(report, null, 2)}`;

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
        console.error("Refiner agent failed:", error);
        const encoder = new TextEncoder();
        const errorMessage = `Error refining draft: ${error instanceof Error ? error.message : String(error)}`;
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      }
    },
  });
}
