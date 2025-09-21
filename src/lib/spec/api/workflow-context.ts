import type { CoreMessage } from "ai";

import { readKnowledgeDirectory } from "@/lib/knowledge/reader";
import { performCompetitorResearch } from "@/lib/research/webSearch";

import { buildSystemPrompt, buildUserPrompt } from "../prompt";

import {
  createPhaseFrame,
  encodeStreamFrame,
  withErrorRecovery,
} from "../streaming";

import type { SpecPack } from "../types";

export interface WorkflowContext {
  specText: string;
  pack: SpecPack;
  maxAttempts: number;
  startTime: number;
  safeEnqueue: (frame: Uint8Array) => void;
}

export async function loadKnowledgeBase(
  context: WorkflowContext
): Promise<string> {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("loading-knowledge", 0, "Loading knowledge base")
    )
  );

  const knowledgeFiles = await withErrorRecovery(
    () => readKnowledgeDirectory("./knowledge"),
    "Knowledge loading"
  );

  let knowledgeContext = "";
  if (knowledgeFiles.length > 0) {
    knowledgeContext = `\n\nKnowledge Base Context:\n${knowledgeFiles
      .map((f) => `${f.path}:\n${f.content}`)
      .join("\n\n")}`;
  }

  return knowledgeContext;
}

export function performResearch(context: WorkflowContext): string {
  context.safeEnqueue(
    encodeStreamFrame(
      createPhaseFrame("performing-research", 0, "Researching competitors")
    )
  );

  const researchResult = performCompetitorResearch([
    "Zscaler",
    "Island",
    "Talon",
    "Microsoft Edge for Business",
  ]);

  let researchContext = "";
  if (researchResult.competitors.length > 0) {
    researchContext += `\n\nCompetitor Research Results:\n${researchResult.competitors
      .map(
        (c) =>
          `${c.vendor}:\n- Onboarding: ${c.onboardingDefaults}\n- Policy Templates: ${c.policyTemplates}\n- Enterprise Browser: ${c.enterpriseBrowser}\n- Data Protection: ${c.dataProtection}\n- Mobile Support: ${c.mobileSupport}`
      )
      .join("\n\n")}`;
  }

  if (researchResult.autoFilledFacts.length > 0) {
    researchContext += `\n\nAuto-filled Facts: ${researchResult.autoFilledFacts.join(
      ", "
    )}`;
  }

  return researchContext;
}

export function buildContextualMessages(
  specText: string,
  pack: SpecPack,
  knowledgeContext: string,
  researchContext: string
): CoreMessage[] {
  const systemPrompt =
    buildSystemPrompt(pack) + knowledgeContext + researchContext;
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: buildUserPrompt(specText) },
  ];
}
