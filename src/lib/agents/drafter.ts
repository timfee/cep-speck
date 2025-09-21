/**
 * Drafter agent that combines mega-prompt with registry toPrompt functions
 */

import type { CoreMessage, StreamTextResult } from "ai";

import { loadPrompt } from "./prompt-loader";
import type { AgentContext, AgentResult, StreamingAgent } from "./types";
import { getResilientAI } from "../ai/resilient";
import { buildSystemPrompt, buildUserPrompt } from "../spec/prompt";
import type { SpecPack } from "../spec/types";

/**
 * Configuration for the Drafter agent
 */
export interface DrafterConfig {
  /** Path to the master prompt file */
  masterPromptPath: string;
  /** Whether to include knowledge context in system prompt */
  includeKnowledge: boolean;
  /** Whether to include research context in system prompt */
  includeResearch: boolean;
}

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
 */
const FALLBACK_MASTER_PROMPT = `You are an expert Chrome Enterprise Premium (CEP) Product Manager at Google. 
Generate comprehensive Product Requirements Documents (PRDs) that are precise, factual, and technically sophisticated.

Voice: Direct, concise, executive-level thinking. No marketing language or empty business speak.
Focus: Enterprise browser security, policy management, and admin tooling.
Approach: Use structured placeholders when uncertain, avoid inventing facts.`;

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
    const messages = await this.buildMessages(context);
    return await this.ai.generateWithFallback(messages);
  }

  public async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const streamResult = await this.executeStreaming(context);

    let content = "";
    let tokenCount = 0;
    for await (const delta of streamResult.textStream) {
      content += delta;
      tokenCount++;
    }

    return {
      content,
      metadata: {
        tokenCount,
        duration: Date.now() - startTime,
        agentId: this.id,
      },
    };
  }

  private async buildMessages(context: AgentContext): Promise<CoreMessage[]> {
    const { userInput, pack, knowledgeContext, researchContext } = context;

    // Load master prompt
    const masterPrompt = await loadPrompt({
      path: this.config.masterPromptPath,
      cache: true,
      fallback: FALLBACK_MASTER_PROMPT,
    });

    // Build system prompt with validation rules
    const validationRules = buildSystemPrompt(pack);
    let systemPrompt =
      masterPrompt +
      "\n\n## Validation Requirements\n\n" +
      "The following validation rules MUST be followed:\n\n" +
      validationRules;

    // Add optional contexts
    if (
      this.config.includeKnowledge &&
      knowledgeContext !== undefined &&
      knowledgeContext.length > 0
    ) {
      systemPrompt += knowledgeContext;
    }
    if (
      this.config.includeResearch &&
      researchContext !== undefined &&
      researchContext.length > 0
    ) {
      systemPrompt += researchContext;
    }

    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: buildUserPrompt(userInput) },
    ];
  }
}

/**
 * Convenience function to run the Drafter agent
 */
export async function runDrafterAgent(
  userInput: string,
  pack: SpecPack,
  knowledgeContext?: string,
  researchContext?: string
): Promise<StreamTextResult<Record<string, never>, never>> {
  const drafter = new DrafterAgent();
  return await drafter.executeStreaming({
    userInput,
    pack,
    knowledgeContext,
    researchContext,
  });
}
