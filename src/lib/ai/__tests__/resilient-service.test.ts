/**
 * Tests for ResilientAI service
 * This test file is specifically created to address the AI provider failure issue.
 */

import { GeminiProvider } from "../providers";
import { ResilientAI } from "../resilient-service";

// Mock the AI provider
class MockGeminiProvider extends GeminiProvider {
  constructor(private readonly mockIsAvailable: boolean = false) {
    super();
  }

  isAvailable(): Promise<boolean> {
    return Promise.resolve(this.mockIsAvailable);
  }

  async generate(): Promise<any> {
    if (!this.mockIsAvailable) {
      throw new Error(
        "Missing Google Generative AI API key - Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local and restart the development server"
      );
    }
    return Promise.resolve({} as any);
  }

  getAvailabilityStatus(): Promise<{
    available: boolean;
    reason?: string;
    actionRequired?: string;
  }> {
    if (!this.mockIsAvailable) {
      return Promise.resolve({
        available: false,
        reason: "Missing Google Generative AI API key",
        actionRequired:
          "Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local and restart the development server",
      });
    }
    return Promise.resolve({ available: true });
  }
}

describe("ResilientAI Service", () => {
  describe("when no providers are available", () => {
    it("should throw a clear error for generateObjectWithFallback", async () => {
      // Create a provider that's not available (like when API key is missing)
      const unavailableProvider = new MockGeminiProvider(false);
      const resilientAI = new ResilientAI([unavailableProvider]);

      // Try to generate an object
      const promise = resilientAI.generateObjectWithFallback({
        prompt: "Test prompt",
        schema: {} as any,
      });

      await expect(promise).rejects.toThrow(
        "All AI providers failed for generateObject. Last error: Missing Google Generative AI API key - Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local and restart the development server"
      );
    });

    it("should throw a clear error for generateWithFallback", async () => {
      const unavailableProvider = new MockGeminiProvider(false);
      const resilientAI = new ResilientAI([unavailableProvider]);

      const promise = resilientAI.generateWithFallback([
        { role: "user", content: "test" },
      ]);

      await expect(promise).rejects.toThrow(
        "All AI providers failed. Last error: Missing Google Generative AI API key - Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local and restart the development server"
      );
    });
  });

  describe("when providers are available", () => {
    it("should successfully generate when provider is available", async () => {
      // Mock the import to avoid real API calls
      const mockGenerateObject = jest.fn().mockResolvedValue({
        object: { test: "result" },
      });

      // Mock the AI imports
      jest.doMock("ai", () => ({
        generateObject: mockGenerateObject,
      }));

      jest.doMock("@ai-sdk/google", () => ({
        google: jest.fn().mockReturnValue("mocked-model"),
      }));

      jest.doMock("@/lib/config", () => ({
        AI_MODEL_PRIMARY: "gemini-1.5-pro",
      }));

      const availableProvider = new MockGeminiProvider(true);
      const resilientAI = new ResilientAI([availableProvider]);

      const result = await resilientAI.generateObjectWithFallback({
        prompt: "Test prompt",
        schema: {} as any,
      });

      expect(result).toEqual({ object: { test: "result" } });
      expect(mockGenerateObject).toHaveBeenCalled();
    });
  });

  describe("provider status", () => {
    it("should return correct provider status", () => {
      const provider = new MockGeminiProvider(false);
      const resilientAI = new ResilientAI([provider]);

      const status = resilientAI.getProviderStatus();

      expect(status).toHaveLength(1);
      expect(status[0]).toEqual({
        name: "gemini",
        available: false,
      });
    });

    it("should return detailed provider status with reasons", async () => {
      const provider = new MockGeminiProvider(false);
      const resilientAI = new ResilientAI([provider]);

      const detailedStatus = await resilientAI.getDetailedProviderStatus();

      expect(detailedStatus).toHaveLength(1);
      expect(detailedStatus[0]).toEqual({
        name: "gemini",
        available: false,
        reason: "Missing Google Generative AI API key",
        actionRequired:
          "Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local and restart the development server",
      });
    });

    it("should return detailed status for available provider", async () => {
      const provider = new MockGeminiProvider(true);
      const resilientAI = new ResilientAI([provider]);

      const detailedStatus = await resilientAI.getDetailedProviderStatus();

      expect(detailedStatus).toHaveLength(1);
      expect(detailedStatus[0]).toEqual({
        name: "gemini",
        available: true,
      });
    });
  });
});
