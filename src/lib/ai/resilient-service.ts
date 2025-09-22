import type { CoreMessage, StreamTextResult } from "ai";
import type { z } from "zod";

import { RETRY_LIMITS } from "@/lib/constants";

import type { AIProvider } from "./providers";

import {
  attemptObjectWithProvider,
  attemptWithProvider,
  getNextProviderIndex,
} from "./retry-helpers";

/**
 * Resilient AI service with retry logic and multiple providers
 */
export class ResilientAI {
  private readonly providers: AIProvider[] = [];
  private currentProviderIndex = 0;

  constructor(providers: AIProvider[]) {
    this.providers = providers;
  }

  async generateWithFallback(
    messages: CoreMessage[],
    maxRetries: number = RETRY_LIMITS.DEFAULT_MAX_ATTEMPTS,
    retryDelay: number = 1000
  ): Promise<StreamTextResult<Record<string, never>, never>> {
    let lastError: Error | null = null;
    const retryConfig = { maxRetries, retryDelay };

    // Try each provider with explicit indexing for provider rotation
    for (const [_providerAttempt] of this.providers.entries()) {
      const provider = this.providers[this.currentProviderIndex];

      const result = await attemptWithProvider(provider, messages, retryConfig);

      if (result.success && result.result) {
        return result.result;
      }

      if (result.error) {
        lastError = result.error;
      }

      // Move to next provider
      this.currentProviderIndex = getNextProviderIndex(
        this.currentProviderIndex,
        this.providers.length
      );
    }

    // All providers failed
    throw new Error(
      `All AI providers failed. Last error: ${lastError?.message}`
    );
  }

  async generateObjectWithFallback<T>(options: {
    prompt: string;
    schema: z.ZodSchema<T>;
    maxRetries?: number;
    retryDelay?: number;
  }): Promise<{ object: T }> {
    const {
      prompt,
      schema,
      maxRetries = RETRY_LIMITS.DEFAULT_MAX_ATTEMPTS,
      retryDelay = 1000,
    } = options;
    let lastError: Error | null = null;
    const retryConfig = { maxRetries, retryDelay };

    // Try each provider with retries using explicit indexing for provider rotation
    for (const [_providerAttempt] of this.providers.entries()) {
      const provider = this.providers[this.currentProviderIndex];

      const result = await attemptObjectWithProvider(
        provider,
        prompt,
        schema,
        retryConfig
      );

      if (result.success && result.result) {
        return result.result;
      }

      if (result.error) {
        lastError = result.error;
      }

      // Move to next provider
      this.currentProviderIndex = getNextProviderIndex(
        this.currentProviderIndex,
        this.providers.length
      );
    }

    // All providers failed
    throw new Error(
      `All AI providers failed for generateObject. Last error: ${lastError?.message}`
    );
  }

  getProviderStatus(): { name: string; available: boolean }[] {
    return this.providers.map((provider) => ({
      name: provider.name,
      available: false, // Would need async check
    }));
  }
}
