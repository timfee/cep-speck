import type { CoreMessage } from "ai";

import type {
  SerializedWorkflowOutline,
  SerializedWorkflowSpec,
} from "@/types/workflow";

import { buildSystemPrompt, buildUserPrompt } from "../prompt";
import type { SpecPack } from "../types";

export { loadKnowledgeBase, performResearch } from "./workflow-context-loaders";

export interface WorkflowContext {
  specText: string;
  structuredSpec?: SerializedWorkflowSpec;
  outlinePayload?: SerializedWorkflowOutline;
  pack: SpecPack;
  maxAttempts: number;
  startTime: number;
  safeEnqueue: (frame: Uint8Array) => void;
}

export function buildContextualMessages(
  specText: string,
  pack: SpecPack,
  knowledgeContext: string,
  researchContext: string,
  options: {
    structuredSpec?: SerializedWorkflowSpec;
    outlinePayload?: SerializedWorkflowOutline;
  } = {}
): CoreMessage[] {
  const systemPrompt =
    buildSystemPrompt(pack) + knowledgeContext + researchContext;
  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: buildUserPrompt({
        specText,
        structuredSpec: options.structuredSpec,
        outlinePayload: options.outlinePayload,
      }),
    },
  ];
}
