import { readKnowledgeDirectory } from "@/lib/knowledge/reader";
import { performCompetitorResearch } from "@/lib/research/web-search";

import {
  createPhaseFrame,
  encodeStreamFrame,
  withErrorRecovery,
} from "../streaming";

import type { WorkflowContext } from "./workflow-context";

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
