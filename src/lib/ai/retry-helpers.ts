import type { CoreMessage, StreamTextResult } from "ai";
import type { z } from "zod";

import type { AIProvider } from "./resilient";

/**
 * Retry configuration for provider operations
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
}

/**
 * Result of a provider attempt
 */
export interface ProviderAttemptResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
}

/**
 * Check provider availability and throw detailed error if not available
 */
async function validateProviderAvailability(
  provider: AIProvider
): Promise<void> {
  const isAvailable = await provider.isAvailable();

  if (!isAvailable) {
    // Get detailed availability status if available
    if (provider.getAvailabilityStatus) {
      try {
        const status = await provider.getAvailabilityStatus();
        // Properly format the error message
        const errorMessage =
          status.reason != null &&
          status.reason !== "" &&
          status.actionRequired != null &&
          status.actionRequired !== ""
            ? `${status.reason} - ${status.actionRequired}`
            : (status.reason ??
              `Provider ${provider.name} is not available. Check configuration and API keys.`);
        throw new Error(errorMessage);
      } catch (statusError) {
        // If getting status fails, throw the status error itself if it's descriptive
        if (
          statusError instanceof Error &&
          statusError.message.includes("API key")
        ) {
          throw statusError;
        }
        // Otherwise fallback to generic message
        throw new Error(
          `Provider ${provider.name} is not available. Check configuration and API keys.`
        );
      }
    }
    throw new Error(
      `Provider ${provider.name} is not available. Check configuration and API keys.`
    );
  }
}

/**
 * Handle retry logic with exponential backoff
 */
async function handleRetry(
  retry: number,
  maxRetries: number,
  retryDelay: number
): Promise<boolean> {
  // Wait before retry (exponential backoff)
  if (retry < maxRetries - 1) {
    await delay(retryDelay * Math.pow(2, retry));
    return true; // Continue retrying
  }
  return false; // Stop retrying
}

/**
 * Attempts to generate text with a specific provider with retry logic
 */
export async function attemptWithProvider(
  provider: AIProvider,
  messages: CoreMessage[],
  config: RetryConfig
): Promise<
  ProviderAttemptResult<StreamTextResult<Record<string, never>, never>>
> {
  const { maxRetries, retryDelay } = config;

  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      await validateProviderAvailability(provider);

      console.log(
        `Generating with ${provider.name} (attempt ${retry + 1}/${maxRetries})`
      );

      const result = await provider.generate(messages);
      return { success: true, result };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.warn(
        `Provider ${provider.name} failed (attempt ${retry + 1}/${maxRetries}):`,
        errorObj.message
      );

      const shouldContinue = await handleRetry(retry, maxRetries, retryDelay);
      if (!shouldContinue) {
        return { success: false, error: errorObj };
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  return { success: false, error: new Error("Unexpected retry loop exit") };
}

/**
 * Attempts to generate object with a specific provider with retry logic
 */
export async function attemptObjectWithProvider<T>(
  provider: AIProvider,
  prompt: string,
  schema: z.ZodSchema<T>,
  config: RetryConfig
): Promise<ProviderAttemptResult<{ object: T }>> {
  const { maxRetries, retryDelay } = config;

  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      await validateProviderAvailability(provider);

      console.log(
        `Generating object with ${provider.name} (attempt ${retry + 1}/${maxRetries})`
      );

      // Use generateObject with the provider's model
      const { generateObject } = await import("ai");
      const { google } = await import("@ai-sdk/google");
      const { AI_MODEL_PRIMARY } = await import("@/lib/config");

      const result = await generateObject({
        model: google(AI_MODEL_PRIMARY),
        prompt,
        schema,
      });

      return { success: true, result };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.warn(
        `Provider ${provider.name} generateObject failed (attempt ${retry + 1}/${maxRetries}):`,
        errorObj.message
      );

      const shouldContinue = await handleRetry(retry, maxRetries, retryDelay);
      if (!shouldContinue) {
        return { success: false, error: errorObj };
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  return { success: false, error: new Error("Unexpected retry loop exit") };
}

/**
 * Utility function for delays with exponential backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rotates to the next provider index in a circular fashion
 */
export function getNextProviderIndex(
  currentIndex: number,
  providerCount: number
): number {
  return (currentIndex + 1) % providerCount;
}
