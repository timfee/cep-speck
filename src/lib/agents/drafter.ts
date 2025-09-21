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
 * Drafter agent that combines master mega-prompt with existing validation rules
 *
 * The Drafter integrates:
 * 1. Master mega-prompt with domain knowledge and generation instructions
 * 2. Existing toPrompt() functions from validation items via buildSystemPrompt()
 * 3. Optional knowledge base and research context
 *
 * This preserves the "define-once" architecture while adding sophisticated AI capabilities.
 */
export class DrafterAgent implements StreamingAgent {
  public readonly id = "drafter";
  public readonly description =
    "Generates comprehensive PRDs using master prompt combined with validation rules";

  private readonly config: DrafterConfig;
  private readonly ai = getResilientAI();

  /**
   * Create a new Drafter agent
   *
   * @param config - Optional configuration overrides
   */
  constructor(config: Partial<DrafterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute the drafter agent with streaming response
   *
   * @param context - Agent execution context
   * @returns Promise resolving to streaming text result
   */
  public async executeStreaming(
    context: AgentContext
  ): Promise<StreamTextResult<Record<string, never>, never>> {
    const messages = await this.buildMessages(context);
    return await this.ai.generateWithFallback(messages);
  }

  /**
   * Execute the drafter agent and return complete result
   *
   * @param context - Agent execution context
   * @returns Promise resolving to complete agent result
   */
  public async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();

    const streamResult = await this.executeStreaming(context);

    let content = "";
    let tokenCount = 0;

    for await (const delta of streamResult.textStream) {
      content += delta;
      tokenCount++;
    }

    const duration = Date.now() - startTime;

    return {
      content,
      metadata: {
        tokenCount,
        duration,
        agentId: this.id,
      },
    };
  }

  /**
   * Build the complete message array for AI generation
   *
   * Combines:
   * 1. Master prompt from guides/prompts/drafter-master.md
   * 2. Existing validation rules via buildSystemPrompt()
   * 3. Optional knowledge and research context
   * 4. User input as user message
   *
   * @param context - Agent execution context
   * @returns Array of core messages for AI generation
   */
  private async buildMessages(context: AgentContext): Promise<CoreMessage[]> {
    const { userInput, pack, knowledgeContext, researchContext } = context;

    // Load master prompt
    const masterPrompt = await loadPrompt({
      path: this.config.masterPromptPath,
      cache: true,
      fallback: this.getFallbackMasterPrompt(),
    });

    // Get existing validation rules via buildSystemPrompt
    const validationRules = buildSystemPrompt(pack);

    // Build complete system prompt
    let systemPrompt = masterPrompt;

    // Add validation rules section
    systemPrompt += "\n\n## Validation Requirements\n\n";
    systemPrompt += "The following validation rules MUST be followed:\n\n";
    systemPrompt += validationRules;

    // Add knowledge context if available and enabled
    if (
      this.config.includeKnowledge &&
      knowledgeContext !== undefined &&
      knowledgeContext.length > 0
    ) {
      systemPrompt += knowledgeContext;
    }

    // Add research context if available and enabled
    if (
      this.config.includeResearch &&
      researchContext !== undefined &&
      researchContext.length > 0
    ) {
      systemPrompt += researchContext;
    }

    // Build user prompt
    const userPrompt = buildUserPrompt(userInput);

    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
  }

  /**
   * Fallback master prompt if file cannot be loaded
   */
  private getFallbackMasterPrompt(): string {
    return `You are an expert Chrome Enterprise Premium (CEP) Product Manager at Google. 
Generate comprehensive Product Requirements Documents (PRDs) that are precise, factual, and technically sophisticated.

Voice: Direct, concise, executive-level thinking. No marketing language or empty business speak.
Focus: Enterprise browser security, policy management, and admin tooling.
Approach: Use structured placeholders when uncertain, avoid inventing facts.`;
  }
}

/**
 * Convenience function to run the Drafter agent
 *
 * @param userInput - User specification text
 * @param pack - Validation pack configuration
 * @param knowledgeContext - Optional knowledge base context
 * @param researchContext - Optional research context
 * @returns Promise resolving to streaming text result
 *
 * @example
 * ```typescript
 * const result = await runDrafterAgent(
 *   "Project: Enhanced Policy Management\nTarget SKU: premium",
 *   pack,
 *   knowledgeContext,
 *   researchContext
 * );
 *
 * for await (const delta of result.textStream) {
 *   console.log(delta);
 * }
 * ```
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
