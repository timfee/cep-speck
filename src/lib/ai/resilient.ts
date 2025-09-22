import { google } from "@ai-sdk/google";

import { AI_MODEL_PRIMARY } from "@/lib/config";

import { GeminiProvider } from "./providers";
import { ResilientAI } from "./resilient-service";

/**
 * Singleton instance for the application
 */
let resilientAI: ResilientAI | null = null;

export function getResilientAI(): ResilientAI {
  if (!resilientAI) {
    // Initialize providers
    const providers = [new GeminiProvider()];
    // Future: Add more providers like OpenAI, Anthropic, etc.
    resilientAI = new ResilientAI(providers);
  }
  return resilientAI;
}

/**
 * Legacy function for backward compatibility
 */
export function geminiModel() {
  return google(AI_MODEL_PRIMARY);
}

// Re-export types and classes for external use
export type { AIProvider } from "./providers";
export { CircuitState } from "./circuit-breaker";
export { ResilientAI } from "./resilient-service";
