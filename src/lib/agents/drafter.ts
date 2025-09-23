/**
 * Drafter agent that combines mega-prompt with registry toPrompt functions
 */

import type { StreamTextResult } from "ai";

import type {
  SerializedWorkflowOutline,
  SerializedWorkflowSpec,
} from "@/types/workflow";

import { buildDrafterMessages } from "./drafter-messages";

import type {
  AgentContext,
  AgentResult,
  DrafterConfig,
  StreamingAgent,
} from "./types";

import { getResilientAI } from "../ai/resilient";
import type { SpecPack } from "../spec/types";

/**
 * Default configuration for the Drafter agent
 */
const DEFAULT_CONFIG: DrafterConfig = {
  masterPromptPath: "guides/prompts/drafter-master.md",
  includeKnowledge: true,
  includeResearch: true,
};

/**
 * Fallback master prompt if file cannot be loaded
 * Condensed version of the full master prompt with key guidelines
 */
export const FALLBACK_MASTER_PROMPT = `You are an expert Chrome Enterprise Premium (CEP) Product Manager at Google, specializing in enterprise browser security, policy management, and admin tooling.

## Voice and Tone
- L7+ Google PM voice: Direct, concise, executive-level thinking
- No marketing language, buzzwords, or empty business speak
- Technical sophistication with deep enterprise browser knowledge
- Use structured placeholders when uncertain, avoid inventing facts

## PRD Structure (9 sections required):
1. TL;DR - Executive summary with key metrics and timeline
2. People Problems - Specific user pain points with evidence  
3. Goals - Measurable objectives aligned to business outcomes
4. Key Personas - Primary users with specific roles and contexts
5. Customer Journey (CUJs) - Detailed user workflows and interactions
6. Functional Requirements - Technical specifications and capabilities
7. Success Metrics - Quantified measurement criteria
8. Technical Considerations - Architecture, dependencies, constraints
9. Go-to-Market - Launch strategy and rollout plan

## Content Guidelines
- Every metric requires: units, timeframe, and source of truth (SoT)
- Use realistic adoption curves (10-20% month 1, 40-60% month 3)
- Explicitly state SKU: Core, Premium, or Both for each feature
- Account for engineering, testing, and rollout phases
- Target 1400 words, hard cap 1800 words
- Header format: "# {n}. {title}" (e.g., "# 1. TL;DR")

Focus: Enterprise browser security, policy management, admin tooling, and Chrome Enterprise Premium capabilities.`;

/**
 * Drafter agent that combines master mega-prompt with existing validation rules
 *
 * This preserves the "define-once" architecture while adding sophisticated AI capabilities.
 */
export class DrafterAgent implements StreamingAgent {
  public readonly id = "drafter";
  public readonly description =
    "Generates comprehensive PRDs using master prompt combined with validation rules";

  private readonly config: DrafterConfig;
  private readonly ai = getResilientAI();

  constructor(config: Partial<DrafterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public async executeStreaming(
    context: AgentContext
  ): Promise<StreamTextResult<Record<string, never>, never>> {
    const messages = await buildDrafterMessages(
      context,
      this.config,
      FALLBACK_MASTER_PROMPT
    );
    return await this.ai.generateWithFallback(messages);
  }

  public async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const streamResult = await this.executeStreaming(context);

    let content = "";
    for await (const delta of streamResult.textStream) {
      content += delta;
    }

    const duration = Date.now() - startTime;

    // Use token count from streamResult.totalUsage if available, else undefined
    const usage = await streamResult.totalUsage;
    const tokenCount = usage.totalTokens;

    return {
      content,
      metadata: {
        tokenCount,
        duration,
        agentId: this.id,
      },
    };
  }
}

/**
 * Convenience function to run the Drafter agent
 */
export async function runDrafterAgent(
  userInput: string,
  pack: SpecPack,
  knowledgeContext?: string,
  researchContext?: string,
  structuredSpec?: SerializedWorkflowSpec,
  outlinePayload?: SerializedWorkflowOutline
): Promise<StreamTextResult<Record<string, never>, never>> {
  const drafter = new DrafterAgent();
  return await drafter.executeStreaming({
    userInput,
    structuredSpec,
    outlinePayload,
    pack,
    knowledgeContext,
    researchContext,
  });
}
