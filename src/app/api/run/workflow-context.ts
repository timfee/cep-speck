import type { CoreMessage } from "ai";

import { readKnowledgeDirectory } from "@/lib/knowledge";
import { performCompetitorResearch } from "@/lib/research";

import type {
  SerializedWorkflowOutline,
  SerializedWorkflowSpec,
} from "@/types/workflow";

import { buildSystemPrompt, buildUserPrompt } from "../prompt";

import {
  createPhaseFrame,
  encodeStreamFrame,
  withErrorRecovery,
} from "../streaming";

import type { SpecPack } from "../types";

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

  return formatKnowledgeContext(knowledgeFiles);
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

  return formatResearchContext(researchResult);
}

function formatKnowledgeContext(
  files: Array<{ path: string; content: string }>
): string {
  if (files.length === 0) {
    return "";
  }

  const entries = files
    .map((file) => `${file.path}:\n${file.content}`)
    .join("\n\n");
  return `\n\nKnowledge Base Context:\n${entries}`;
}

function formatResearchContext(
  result: ReturnType<typeof performCompetitorResearch>
): string {
  const sections: string[] = [];

  if (result.competitors.length > 0) {
    const competitorSummaries = result.competitors
      .map((competitor) =>
        [
          `${competitor.vendor}:`,
          `- Onboarding: ${competitor.onboardingDefaults}`,
          `- Policy Templates: ${competitor.policyTemplates}`,
          `- Enterprise Browser: ${competitor.enterpriseBrowser}`,
          `- Data Protection: ${competitor.dataProtection}`,
          `- Mobile Support: ${competitor.mobileSupport}`,
        ].join("\n")
      )
      .join("\n\n");

    sections.push(`\n\nCompetitor Research Results:\n${competitorSummaries}`);
  }

  if (result.autoFilledFacts.length > 0) {
    sections.push(
      `\n\nAuto-filled Facts: ${result.autoFilledFacts.join(", ")}`
    );
  }

  return sections.join("");
}
