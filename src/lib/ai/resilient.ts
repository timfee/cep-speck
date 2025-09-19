import { google } from "@ai-sdk/google";
import { streamText, type CoreMessage, type StreamTextResult } from "ai";

import { AI_MODEL_PRIMARY } from "@/lib/config";
import { CIRCUIT_BREAKER, RETRY_LIMITS } from "@/lib/constants";

import type { z } from "zod";

/**
 * Abstract AI provider interface for multi-provider architecture
 */
export interface AIProvider {
  name: string;
  generate(
    messages: CoreMessage[]
  ): Promise<StreamTextResult<Record<string, never>, never>>;
  isAvailable(): Promise<boolean>;
}

/**
 * Circuit breaker states
 */
enum CircuitState {
  CLOSED = "closed",
  OPEN = "open",
  HALF_OPEN = "half-open",
}

/**
 * Circuit breaker for AI provider resilience
 */
class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttempt = Date.now();

  constructor(
    private readonly failureThreshold: number = CIRCUIT_BREAKER.FAILURE_THRESHOLD,
    private readonly recoveryTimeout: number = CIRCUIT_BREAKER.RECOVERY_TIMEOUT,
    private readonly successThreshold: number = CIRCUIT_BREAKER.SUCCESS_THRESHOLD
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(
          `Circuit breaker is OPEN. Next attempt at ${new Date(
            this.nextAttempt
          ).toISOString()}`
        );
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.recoveryTimeout;
    }
  }

  getState() {
    return this.state;
  }
}

/**
 * Gemini AI provider implementation
 */
class GeminiProvider implements AIProvider {
  name = "gemini";
  private readonly circuitBreaker = new CircuitBreaker();

  async generate(
    messages: CoreMessage[]
  ): Promise<StreamTextResult<Record<string, never>, never>> {
    return await this.circuitBreaker.execute(async () => {
      return Promise.resolve(
        streamText({
          model: google(AI_MODEL_PRIMARY),
          messages,
        })
      );
    });
  }

  async isAvailable(): Promise<boolean> {
    if ((process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "").length === 0) {
      return false;
    }

    try {
      // Simple health check
      await this.circuitBreaker.execute(async () => {
        const result = streamText({
          model: google(AI_MODEL_PRIMARY),
          messages: [{ role: "user", content: "Hi" }],
        });
        // We don't need to wait for the stream, just creating it tests the API
        return Promise.resolve(result);
      });
      return true;
    } catch (healthCheckError) {
      // Health check failed - provider not available
      console.warn("AI provider health check failed:", {
        error: healthCheckError instanceof Error ? healthCheckError.message : String(healthCheckError)
      });
      return false;
    }
  }
}

/**
 * Resilient AI service with retry logic and multiple providers
 */
export class ResilientAI {
  private readonly providers: AIProvider[] = [];
  private currentProviderIndex = 0;

  constructor() {
    // Initialize providers
    this.providers.push(new GeminiProvider());
    // Future: Add more providers like OpenAI, Anthropic, etc.
  }

  async generateWithFallback(
    messages: CoreMessage[],
    maxRetries: number = RETRY_LIMITS.DEFAULT_MAX_ATTEMPTS,
    retryDelay: number = 1000
  ): Promise<StreamTextResult<Record<string, never>, never>> {
    let lastError: Error | null = null;

    // Try each provider with explicit indexing for provider rotation
    for (const [_providerAttempt] of this.providers.entries()) {
      const provider = this.providers[this.currentProviderIndex];

      // Try with retries for current provider
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const isAvailable = await provider.isAvailable();
          if (!isAvailable) {
            throw new Error(`Provider ${provider.name} is not available`);
          }

          console.log(
            `Generating with ${provider.name} (attempt ${
              retry + 1
            }/${maxRetries})`
          );
          return await provider.generate(messages);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(
            `Provider ${provider.name} failed (attempt ${
              retry + 1
            }/${maxRetries}):`,
            lastError.message
          );

          // Wait before retry (exponential backoff)
          if (retry < maxRetries - 1) {
            await this.delay(retryDelay * Math.pow(2, retry));
          }
        }
      }

      // Move to next provider
      this.currentProviderIndex =
        (this.currentProviderIndex + 1) % this.providers.length;
    }

    // All providers failed
    throw new Error(
      `All AI providers failed. Last error: ${lastError?.message}`
    );
  }

  async generateObjectWithFallback<T>(
    options: {
      prompt: string;
      schema: z.ZodSchema<T>;
      maxRetries?: number;
      retryDelay?: number;
    }
  ): Promise<{ object: T }> {
    const { prompt, schema, maxRetries = RETRY_LIMITS.DEFAULT_MAX_ATTEMPTS, retryDelay = 1000 } = options;
    let lastError: Error | null = null;

    // Try each provider with retries using explicit indexing for provider rotation
    for (const [_providerAttempt] of this.providers.entries()) {
      const provider = this.providers[this.currentProviderIndex];

      // Try with retries for current provider
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const isAvailable = await provider.isAvailable();
          if (!isAvailable) {
            throw new Error(`Provider ${provider.name} is not available`);
          }

          console.log(
            `Generating object with ${provider.name} (attempt ${
              retry + 1
            }/${maxRetries})`
          );
          
          // Use generateObject with the provider's model
          const { generateObject } = await import("ai");
          return await generateObject({
            model: google(AI_MODEL_PRIMARY), // Use centralized model config
            prompt,
            schema,
          });
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(
            `Provider ${provider.name} generateObject failed (attempt ${
              retry + 1
            }/${maxRetries}):`,
            lastError.message
          );

          // Wait before retry (exponential backoff)
          if (retry < maxRetries - 1) {
            await this.delay(retryDelay * Math.pow(2, retry));
          }
        }
      }

      // Move to next provider
      this.currentProviderIndex =
        (this.currentProviderIndex + 1) % this.providers.length;
    }

    // All providers failed
    throw new Error(
      `All AI providers failed for generateObject. Last error: ${lastError?.message}`
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getProviderStatus(): { name: string; available: boolean }[] {
    return this.providers.map((provider) => ({
      name: provider.name,
      available: false, // Would need async check
    }));
  }
}

/**
 * Singleton instance for the application
 */
let resilientAI: ResilientAI | null = null;

export function getResilientAI(): ResilientAI {
  resilientAI ??= new ResilientAI();
  return resilientAI;
}

/**
 * Legacy function for backward compatibility
 */
export function geminiModel() {
  return google(AI_MODEL_PRIMARY);
}
