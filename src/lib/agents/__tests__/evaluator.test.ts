/**
 * Simplified tests for Semantic Evaluator Agent
 */

import { getResilientAI } from "@/lib/ai/resilient";

import { runSemanticEvaluator } from "../evaluator";
import { loadPrompt } from "../prompt-loader";

// Mock the AI infrastructure
jest.mock("@/lib/ai/resilient", () => ({
  getResilientAI: jest.fn(() => ({
    generateObjectWithFallback: jest.fn(),
  })),
}));

jest.mock("../prompt-loader", () => ({
  loadPrompt: jest.fn(),
}));

describe("Semantic Evaluator Agent", () => {
  const mockResilientAI = getResilientAI as jest.MockedFunction<
    typeof getResilientAI
  >;
  const mockLoadPrompt = loadPrompt as jest.MockedFunction<typeof loadPrompt>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadPrompt.mockResolvedValue("Mock evaluator prompt");
    mockResilientAI.mockReturnValue({
      generateObjectWithFallback: jest.fn(),
    } as any);
  });

  it("should return semantic issues from AI evaluation", async () => {
    const mockEvaluation = {
      coherence: {
        crossReferenceAccuracy: false,
        narrativeFlow: true,
        personaCoverage: true,
        traceability: false,
        issues: [
          {
            section: "TL;DR",
            description: "Test issue",
            suggestion: "Fix it",
            severity: "error",
          },
        ],
      },
      quality: {
        toneAndVoice: true,
        specificity: false,
        clarity: true,
        conciseness: true,
        issues: [],
      },
      realism: {
        timelinePlausibility: true,
        technicalFeasibility: true,
        marketUnderstanding: true,
        resourceRequirements: true,
        issues: [],
      },
      overallAssessment: {
        isPublicationReady: false,
        criticalIssues: 1,
        improvementNeeded: true,
      },
    };

    const mockGenerateObject = jest
      .fn()
      .mockResolvedValue({ object: mockEvaluation });
    mockResilientAI.mockReturnValue({
      generateObjectWithFallback: mockGenerateObject,
    } as any);

    const result = await runSemanticEvaluator("test content");

    expect(mockLoadPrompt).toHaveBeenCalled();
    expect(mockGenerateObject).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "coherence-0",
      itemId: "semantic-evaluator",
      type: "coherence",
      severity: "error",
    });
  });

  it("should handle AI service errors gracefully", async () => {
    const mockGenerateObject = jest
      .fn()
      .mockRejectedValue(new Error("AI service unavailable"));
    mockResilientAI.mockReturnValue({
      generateObjectWithFallback: mockGenerateObject,
    } as any);

    const result = await runSemanticEvaluator("test content");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "evaluator-error",
      itemId: "semantic-evaluator",
      type: "quality",
      severity: "error",
      message: expect.stringContaining("AI service unavailable"),
    });
  });

  it("should return empty array when no issues found", async () => {
    const mockEvaluation = {
      coherence: {
        crossReferenceAccuracy: true,
        narrativeFlow: true,
        personaCoverage: true,
        traceability: true,
        issues: [],
      },
      quality: {
        toneAndVoice: true,
        specificity: true,
        clarity: true,
        conciseness: true,
        issues: [],
      },
      realism: {
        timelinePlausibility: true,
        technicalFeasibility: true,
        marketUnderstanding: true,
        resourceRequirements: true,
        issues: [],
      },
      overallAssessment: {
        isPublicationReady: true,
        criticalIssues: 0,
        improvementNeeded: false,
      },
    };

    const mockGenerateObject = jest
      .fn()
      .mockResolvedValue({ object: mockEvaluation });
    mockResilientAI.mockReturnValue({
      generateObjectWithFallback: mockGenerateObject,
    } as any);

    const result = await runSemanticEvaluator("Perfect PRD content");

    expect(result).toHaveLength(0);
  });
});
