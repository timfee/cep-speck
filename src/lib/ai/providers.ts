import { google } from "@ai-sdk/google";
import { streamText, type CoreMessage, type StreamTextResult } from "ai";

import { AI_MODEL_PRIMARY } from "@/lib/config";

import { CircuitBreaker } from "./circuit-breaker";

/**
 * Abstract AI provider interface for multi-provider architecture
 */
export interface AIProvider {
  name: string;
  generate(
    messages: CoreMessage[]
  ): Promise<StreamTextResult<Record<string, never>, never>>;
  isAvailable(): Promise<boolean>;
  getAvailabilityStatus?(): Promise<{
    available: boolean;
    reason?: string;
    actionRequired?: string;
  }>;
}

/**
 * Gemini AI provider implementation
 */
export class GeminiProvider implements AIProvider {
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
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";
    if (apiKey.length === 0) {
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
        error:
          healthCheckError instanceof Error
            ? healthCheckError.message
            : String(healthCheckError),
      });
      return false;
    }
  }

  /**
   * Get detailed availability status with reason
   */
  async getAvailabilityStatus(): Promise<{
    available: boolean;
    reason?: string;
    actionRequired?: string;
  }> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";

    if (apiKey.length === 0) {
      return {
        available: false,
        reason: "Missing Google Generative AI API key",
        actionRequired:
          "Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local and restart the development server",
      };
    }

    try {
      // Simple health check
      await this.circuitBreaker.execute(async () => {
        const result = streamText({
          model: google(AI_MODEL_PRIMARY),
          messages: [{ role: "user", content: "Hi" }],
        });
        return Promise.resolve(result);
      });

      return { available: true };
    } catch (healthCheckError) {
      const errorMessage =
        healthCheckError instanceof Error
          ? healthCheckError.message
          : String(healthCheckError);

      return {
        available: false,
        reason: `API health check failed: ${errorMessage}`,
        actionRequired:
          "Check your API key is valid and you have internet connectivity",
      };
    }
  }
}
