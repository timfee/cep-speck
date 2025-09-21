/**
 * Shared types and interfaces for agent system
 */

import type { StreamTextResult } from "ai";

import type { SpecPack } from "../spec/types";

/**
 * Agent execution context containing input data and configuration
 */
export interface AgentContext {
  /** User-provided specification text */
  userInput: string;
  /** Validation pack configuration */
  pack: SpecPack;
  /** Additional context from knowledge base */
  knowledgeContext?: string;
  /** Research context from competitive analysis */
  researchContext?: string;
}

/**
 * Result of agent execution
 */
export interface AgentResult {
  /** Generated content from the agent */
  content: string;
  /** Metadata about the generation process */
  metadata: {
    /** Number of tokens generated */
    tokenCount?: number;
    /** Duration of generation in milliseconds */
    duration: number;
    /** Agent version or identifier */
    agentId: string;
  };
}

/**
 * Interface for AI agents that can generate content
 */
export interface Agent {
  /** Unique identifier for the agent */
  readonly id: string;
  
  /** Human-readable description of agent purpose */
  readonly description: string;
  
  /**
   * Execute the agent with given context
   * @param context - Input context and configuration
   * @returns Promise resolving to agent result
   */
  execute(context: AgentContext): Promise<AgentResult>;
}

/**
 * Interface for streaming AI agents
 */
export interface StreamingAgent extends Agent {
  /**
   * Execute the agent with streaming response
   * @param context - Input context and configuration
   * @returns Promise resolving to streaming result
   */
  executeStreaming(context: AgentContext): Promise<StreamTextResult<Record<string, never>, never>>;
}

/**
 * Configuration for prompt loading
 */
export interface PromptConfig {
  /** Path to the prompt file */
  path: string;
  /** Whether to cache the loaded prompt */
  cache?: boolean;
  /** Fallback content if file cannot be loaded */
  fallback?: string;
}