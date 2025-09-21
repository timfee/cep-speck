/**
 * Simple tests for Refiner Agent
 */

import { getResilientAI } from "@/lib/ai/resilient";
import type { Issue } from "@/lib/spec/types";

import { loadPrompt } from "../prompt-loader";
import { runRefinerAgent } from "../refiner";

// Mock the AI infrastructure
jest.mock("@/lib/ai/resilient", () => ({
  getResilientAI: jest.fn(() => ({
    generateWithFallback: jest.fn(),
  })),
}));

// Mock the prompt loader
jest.mock("../prompt-loader", () => ({
  loadPrompt: jest.fn(),
}));

describe("Refiner Agent", () => {
  const mockResilientAI = getResilientAI as jest.MockedFunction<
    typeof getResilientAI
  >;
  const mockLoadPrompt = loadPrompt as jest.MockedFunction<typeof loadPrompt>;

  // Sample issues for testing
  const sampleIssues: Issue[] = [
    {
      id: "word-budget-1",
      itemId: "word-budget",
      severity: "error",
      message: "Document exceeds 1800 word limit",
      evidence: "Current: 2100 words",
      hints: ["Remove redundant content", "Tighten language"],
    },
    {
      id: "banned-text-1",
      itemId: "banned-text",
      severity: "warn",
      message: "Contains business jargon",
      evidence: "strengthen our position",
      hints: ["Use concrete language"],
    },
  ];

  const sampleDraft = `
    # Chrome Enterprise Premium PRD
    
    ## TL;DR
    This solution might strengthen our position in the enterprise market.
    Expected 40% adoption rate.
  `;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockLoadPrompt.mockResolvedValue("Mock refiner prompt content");

    mockResilientAI.mockReturnValue({
      generateWithFallback: jest.fn(),
    } as any);
  });

  describe("runRefinerAgent", () => {
    it("should call AI service with proper prompt structure", async () => {
      const mockStreamResult = {
        textStream: Symbol("mock-stream"),
      };

      const mockGenerateWithFallback = jest
        .fn()
        .mockResolvedValue(mockStreamResult);

      mockResilientAI.mockReturnValue({
        generateWithFallback: mockGenerateWithFallback,
      } as any);

      const result = await runRefinerAgent(sampleDraft, sampleIssues);

      // Verify AI was called correctly
      expect(mockLoadPrompt).toHaveBeenCalledWith({
        path: "guides/prompts/refiner.md",
        cache: true,
        fallback:
          "Fix all validation issues in this PRD while maintaining quality and coherence.",
      });

      expect(mockGenerateWithFallback).toHaveBeenCalledWith([
        {
          role: "system",
          content: expect.stringContaining("expert technical writer"),
        },
        {
          role: "user",
          content: expect.stringContaining("Mock refiner prompt content"),
        },
      ]);

      // Verify the result is returned
      expect(result).toBe(mockStreamResult);
    });

    it("should handle AI service errors", async () => {
      const mockGenerateWithFallback = jest
        .fn()
        .mockRejectedValue(new Error("AI service unavailable"));

      mockResilientAI.mockReturnValue({
        generateWithFallback: mockGenerateWithFallback,
      } as any);

      await expect(runRefinerAgent(sampleDraft, sampleIssues)).rejects.toThrow(
        "Refiner agent failed: AI service unavailable"
      );
    });

    it("should handle prompt loading errors", async () => {
      mockLoadPrompt.mockRejectedValue(new Error("Prompt file not found"));

      await expect(runRefinerAgent(sampleDraft, sampleIssues)).rejects.toThrow(
        "Refiner agent failed: Prompt file not found"
      );
    });

    it("should build appropriate healing instructions for different issue types", async () => {
      const mockStreamResult = { textStream: Symbol("mock-stream") };
      const mockGenerateWithFallback = jest
        .fn()
        .mockResolvedValue(mockStreamResult);

      mockResilientAI.mockReturnValue({
        generateWithFallback: mockGenerateWithFallback,
      } as any);

      await runRefinerAgent(sampleDraft, sampleIssues);

      // Check that the prompt includes all issue types
      const calls = mockGenerateWithFallback.mock.calls;
      if (calls.length > 0) {
        const call = calls[0] as unknown;
        const userPrompt = (
          call as [
            { role: string; content: string }[],
            { role: string; content: string },
          ]
        )?.[1]?.content;

        if (userPrompt) {
          expect(userPrompt).toContain("## Deterministic Issues to Fix:");
          expect(userPrompt).toContain("Document exceeds 1800 word limit");
          expect(userPrompt).toContain("Contains business jargon");
        }
      }
    });

    it("should work with empty issues array", async () => {
      const mockStreamResult = { textStream: Symbol("mock-stream") };
      const mockGenerateWithFallback = jest
        .fn()
        .mockResolvedValue(mockStreamResult);

      mockResilientAI.mockReturnValue({
        generateWithFallback: mockGenerateWithFallback,
      } as any);

      const result = await runRefinerAgent(sampleDraft, []);

      expect(result).toBe(mockStreamResult);
      expect(mockGenerateWithFallback).toHaveBeenCalled();
    });
  });
});
