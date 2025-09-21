import type { CoreMessage, StreamTextResult } from "ai";

import { getResilientAI } from "@/lib/ai/resilient";
import { AGENT_LIMITS } from "@/lib/constants";
import { readKnowledgeDirectory } from "@/lib/knowledge/reader";

import {
  performCompetitorResearch,
  synthesizeCompetitiveSnapshot,
} from "@/lib/research/webSearch";

import { loadDrafterPrompt, loadFunctionalRequirements } from "./promptLoader";
import type { StructuredOutline } from "./types";

const STOP_WORDS = new Set([
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "these",
  "those",
  "check",
  "focus",
  "include",
  "ensure",
  "consider",
  "notes",
]);

function extractKeywords(outline: StructuredOutline): string[] {
  const keywords = new Set<string>();
  for (const section of outline.sections) {
    keywords.add(section.title.toLowerCase());
    const notes = section.notes ?? "";
    for (const token of notes
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)) {
      if (token.length >= AGENT_LIMITS.KEYWORD_MIN_LENGTH) {
        keywords.add(token);
      }
    }
  }
  return Array.from(keywords).filter(Boolean);
}

async function buildKnowledgeContext(
  outline: StructuredOutline
): Promise<string> {
  const knowledgeFiles = await readKnowledgeDirectory("./knowledge");
  if (knowledgeFiles.length === 0) {
    return "";
  }

  const keywords = extractKeywords(outline);
  const scored = knowledgeFiles
    .map((file) => {
      const lower = file.content.toLowerCase();
      let score = 0;
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          score += 1;
        }
      }
      return { file, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, AGENT_LIMITS.KNOWLEDGE_FILES);

  if (scored.length === 0) {
    return "";
  }

  const serialized = scored
    .map(
      ({ file }) =>
        `### ${file.path}\nLast Modified: ${file.lastModified.toISOString()}\n${file.content.trim()}`
    )
    .join("\n\n");

  return `Knowledge Base Context:\n${serialized}`;
}

function extractCompetitorNames(outline: StructuredOutline): string[] {
  const names = new Set<string>();

  for (const section of outline.sections) {
    const notes = section.notes ?? "";
    const tokens = notes.split(/\s+/);
    const buffer: string[] = [];

    const flushBuffer = () => {
      if (buffer.length === 0) {
        return;
      }
      const candidate = buffer.join(" ");
      if (candidate.length >= AGENT_LIMITS.KEYWORD_MIN_LENGTH) {
        const lower = candidate.toLowerCase();
        if (!STOP_WORDS.has(lower)) {
          names.add(candidate);
        }
      }
      buffer.length = 0;
    };

    for (const token of tokens) {
      const cleaned = token.replace(/[^A-Za-z0-9]/g, "");
      if (cleaned.length === 0) {
        flushBuffer();
        continue;
      }

      const isCapitalized = /^[A-Z][A-Za-z0-9]+$/.test(cleaned);
      if (isCapitalized && !STOP_WORDS.has(cleaned.toLowerCase())) {
        buffer.push(cleaned);
      } else {
        flushBuffer();
      }
    }

    flushBuffer();
  }

  return Array.from(names).slice(0, AGENT_LIMITS.COMPETITOR_VENDORS);
}

function buildResearchContext(vendors: string[]): string {
  if (vendors.length === 0) {
    return "";
  }

  const research = performCompetitorResearch(vendors);
  const competitorDetails = research.competitors
    .map((competitor) => {
      const {
        vendor,
        onboardingDefaults,
        policyTemplates,
        enterpriseBrowser,
        dataProtection,
        mobileSupport,
        source,
        date,
      } = competitor;
      return [
        `Vendor: ${vendor}`,
        `Onboarding: ${onboardingDefaults ?? "[PM_INPUT_NEEDED: onboarding details]"}`,
        `Policy Templates: ${policyTemplates ?? "[PM_INPUT_NEEDED: policy templates]"}`,
        `Enterprise Browser: ${
          enterpriseBrowser ?? "[PM_INPUT_NEEDED: enterprise browser details]"
        }`,
        `Data Protection: ${
          dataProtection ?? "[PM_INPUT_NEEDED: data protection details]"
        }`,
        `Mobile Support: ${
          mobileSupport ?? "[PM_INPUT_NEEDED: mobile support details]"
        }`,
        `Source: ${source ?? "[PM_INPUT_NEEDED: source]"}`,
        `Date: ${date ?? "[PM_INPUT_NEEDED: date]"}`,
      ].join("\n");
    })
    .join("\n\n");

  const citations = research.citations.join(", ");
  const snapshot = synthesizeCompetitiveSnapshot(research.competitors);

  const parts = [
    "Web Research Context:",
    competitorDetails,
    `Snapshot: ${snapshot}`,
  ];

  if (citations.length > 0) {
    parts.push(`Citations: ${citations}`);
  }

  if (research.autoFilledFacts.length > 0) {
    parts.push(`Auto-filled Facts: ${research.autoFilledFacts.join(", ")}`);
  }

  return parts.filter(Boolean).join("\n\n");
}

export async function runDrafterAgent(
  outline: StructuredOutline
): Promise<StreamTextResult<Record<string, never>, never>> {
  const ai = getResilientAI();
  const [systemPrompt, functionalRequirements] = await Promise.all([
    loadDrafterPrompt(),
    loadFunctionalRequirements(),
  ]);

  const [knowledgeContext, researchContext] = await Promise.all([
    buildKnowledgeContext(outline),
    Promise.resolve(extractCompetitorNames(outline)).then((vendors) =>
      buildResearchContext(vendors)
    ),
  ]);

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: [
        systemPrompt,
        functionalRequirements
          ? `Functional Requirements Reference:\n${functionalRequirements.trim()}`
          : "",
        knowledgeContext,
        researchContext,
      ]
        .filter((part) => part.trim().length > 0)
        .join("\n\n"),
    },
    { role: "user", content: JSON.stringify(outline, null, 2) },
  ];

  return ai.generateWithFallback(messages);
}
