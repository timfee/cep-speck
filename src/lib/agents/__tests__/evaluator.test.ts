/**
 * Tests for Semantic Evaluator Agent
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

// Mock the prompt loader
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

    // Setup default mock implementations
    mockLoadPrompt.mockResolvedValue("Mock evaluator prompt content");

    mockResilientAI.mockReturnValue({
      generateObjectWithFallback: jest.fn(),
    } as any);
  });

  describe("runSemanticEvaluator", () => {
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
              description:
                "Metrics don't match between TL;DR and Success Metrics",
              suggestion: "Align metric values across all sections",
              severity: "error" as const,
            },
          ],
        },
        quality: {
          toneAndVoice: true,
          specificity: false,
          clarity: true,
          conciseness: true,
          issues: [
            {
              section: "Success Metrics",
              description: "Metrics lack specific units and timeframes",
              suggestion:
                "Add concrete units, timeframes, and measurement sources",
              severity: "warn" as const,
            },
          ],
        },
        realism: {
          timelinePlausibility: false,
          technicalFeasibility: true,
          marketUnderstanding: true,
          resourceRequirements: true,
          issues: [
            {
              section: "Goals",
              description:
                "95% adoption in 3 months is unrealistic for enterprise",
              suggestion:
                "Adjust timeline to 12-18 months for enterprise adoption",
              severity: "error" as const,
            },
          ],
        },
        overallAssessment: {
          isPublicationReady: false,
          criticalIssues: 2,
          improvementNeeded: true,
        },
      };

      const mockGenerateObject = jest.fn().mockResolvedValue({
        object: mockEvaluation,
      });

      mockResilientAI.mockReturnValue({
        generateObjectWithFallback: mockGenerateObject,
      } as any);

      const draftContent = `
        # Chrome Enterprise Premium PRD
        
        ## TL;DR
        40% enterprise adoption expected
        
        ## Success Metrics
        35% market penetration
      `;

      const result = await runSemanticEvaluator(draftContent);

      // Verify AI was called correctly
      expect(mockLoadPrompt).toHaveBeenCalledWith({
        path: "guides/prompts/semantic-evaluator.md",
        cache: true,
        fallback:
          "Analyze this PRD for semantic quality, coherence, and realism issues.",
      });

      expect(mockGenerateObject).toHaveBeenCalledWith({
        prompt: expect.stringContaining("Mock evaluator prompt content"),
        schema: expect.any(Object),
      });

      // Verify results
      expect(result).toHaveLength(3);

      // Check coherence issue
      expect(result[0]).toMatchObject({
        id: "coherence-0",
        itemId: "semantic-evaluator",
        type: "coherence",
        severity: "error",
        section: "TL;DR",
        message: "Metrics don't match between TL;DR and Success Metrics",
        suggestion: "Align metric values across all sections",
      });

      // Check quality issue
      expect(result[1]).toMatchObject({
        id: "quality-0",
        itemId: "semantic-evaluator",
        type: "quality",
        severity: "warn",
        section: "Success Metrics",
        message: "Metrics lack specific units and timeframes",
        suggestion: "Add concrete units, timeframes, and measurement sources",
      });

      // Check realism issue
      expect(result[2]).toMatchObject({
        id: "realism-0",
        itemId: "semantic-evaluator",
        type: "realism",
        severity: "error",
        section: "Goals",
        message: "95% adoption in 3 months is unrealistic for enterprise",
        suggestion: "Adjust timeline to 12-18 months for enterprise adoption",
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

      // Should return error issue instead of throwing
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "evaluator-error",
        itemId: "semantic-evaluator",
        type: "quality",
        severity: "error",
        section: "system",
        message: "Semantic evaluation failed: AI service unavailable",
        suggestion: "Check AI service availability and try again",
      });
    });

    it("should handle prompt loading errors", async () => {
      mockLoadPrompt.mockRejectedValue(new Error("Prompt file not found"));

      const result = await runSemanticEvaluator("test content");

      expect(result).toHaveLength(1);
      expect(result[0].message).toContain("Semantic evaluation failed");
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

      const mockGenerateObject = jest.fn().mockResolvedValue({
        object: mockEvaluation,
      });

      mockResilientAI.mockReturnValue({
        generateObjectWithFallback: mockGenerateObject,
      } as any);

      const result = await runSemanticEvaluator("Perfect PRD content");

      expect(result).toHaveLength(0);
    });

    it("should use fallback prompt when file loading fails", async () => {
      mockLoadPrompt.mockResolvedValue(
        "Analyze this PRD for semantic quality, coherence, and realism issues."
      );

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

      const mockGenerateObject = jest.fn().mockResolvedValue({
        object: mockEvaluation,
      });

      mockResilientAI.mockReturnValue({
        generateObjectWithFallback: mockGenerateObject,
      } as any);

      const result = await runSemanticEvaluator("test content");

      expect(mockGenerateObject).toHaveBeenCalledWith({
        prompt: expect.stringContaining(
          "Analyze this PRD for semantic quality"
        ),
        schema: expect.any(Object),
      });

      expect(result).toHaveLength(0);
    });
  });
});
