import type { CoreMessage, StreamTextResult } from "ai";

import { getResilientAI } from "@/lib/ai/resilient";

import { loadRefinerPrompt } from "./promptLoader";
import type { EvaluationReport } from "./types";

export async function runRefinerAgent(
  draft: string,
  report: EvaluationReport
): Promise<StreamTextResult<Record<string, never>, never>> {
  const ai = getResilientAI();
  const systemPrompt = await loadRefinerPrompt();

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: [
        "Full Draft:",
        draft.trim(),
        "Issues to Fix:",
        JSON.stringify(report, null, 2),
      ].join("\n\n"),
    },
  ];

  return ai.generateWithFallback(messages);
}
