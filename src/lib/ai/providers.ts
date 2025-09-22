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
        error:
          healthCheckError instanceof Error
            ? healthCheckError.message
            : String(healthCheckError),
      });
      return false;
    }
  }
}
