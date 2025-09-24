/**
 * Simplified tests for Refiner Agent
 */

import { getResilientAI } from "@/lib/ai/resilient";
import type { Issue } from "@/lib/spec/types";

import { loadPrompt } from "./prompt-loader";
import { runRefinerAgent } from "./refiner";

// Mock the AI infrastructure
jest.mock("@/lib/ai/resilient", () => ({
  getResilientAI: jest.fn(() => ({
    generateWithFallback: jest.fn(),
  })),
}));

jest.mock("./prompt-loader", () => ({
  loadPrompt: jest.fn(),
}));

describe("Refiner Agent", () => {
  const mockResilientAI = getResilientAI as jest.MockedFunction<
    typeof getResilientAI
  >;
  const mockLoadPrompt = loadPrompt as jest.MockedFunction<typeof loadPrompt>;

  const sampleIssues: Issue[] = [
    {
      id: "test-1",
      itemId: "word-budget",
      severity: "error",
      message: "Document exceeds limit",
      evidence: "Current: 2100 words",
      hints: ["Remove redundant content"],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadPrompt.mockResolvedValue("Mock refiner prompt");
    mockResilientAI.mockReturnValue({ generateWithFallback: jest.fn() } as any);
  });

  it("should call AI service with proper prompt structure", async () => {
    const mockStreamResult = { textStream: Symbol("mock-stream") };
    const mockGenerateWithFallback = jest
      .fn()
      .mockResolvedValue(mockStreamResult);
    mockResilientAI.mockReturnValue({
      generateWithFallback: mockGenerateWithFallback,
    } as any);

    const result = await runRefinerAgent("test draft", sampleIssues);

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
        content: expect.stringContaining("Mock refiner prompt"),
      },
    ]);

    expect(result).toBe(mockStreamResult);
  });

  it("should handle AI service errors", async () => {
    const mockGenerateWithFallback = jest
      .fn()
      .mockRejectedValue(new Error("AI service unavailable"));
    mockResilientAI.mockReturnValue({
      generateWithFallback: mockGenerateWithFallback,
    } as any);

    await expect(runRefinerAgent("test draft", sampleIssues)).rejects.toThrow(
      "Refiner agent failed: AI service unavailable"
    );
  });

  it("should work with empty issues array", async () => {
    const mockStreamResult = { textStream: Symbol("mock-stream") };
    const mockGenerateWithFallback = jest
      .fn()
      .mockResolvedValue(mockStreamResult);
    mockResilientAI.mockReturnValue({
      generateWithFallback: mockGenerateWithFallback,
    } as any);

    const result = await runRefinerAgent("test draft", []);

    expect(result).toBe(mockStreamResult);
    expect(mockGenerateWithFallback).toHaveBeenCalled();
  });
});
