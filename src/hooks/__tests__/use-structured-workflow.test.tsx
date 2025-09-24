/** @jest-environment jsdom */

import { act, renderHook } from "@testing-library/react/pure";

import { generateContentOutlineFromPrompt } from "@/lib/services/content-outline-service";
import type { ContentOutline } from "@/types/workflow";

jest.mock("@/lib/services/content-outline-service", () => ({
  generateContentOutlineFromPrompt: jest.fn(),
}));

import { useStructuredWorkflow } from "../use-structured-workflow";
import { initialWorkflowState } from "../workflow-initial-state";

describe("useStructuredWorkflow", () => {
  const mockGenerate = generateContentOutlineFromPrompt as jest.MockedFunction<
    typeof generateContentOutlineFromPrompt
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates state through the dispatch map", () => {
    const { result } = renderHook(() => useStructuredWorkflow());

    act(() => {
      result.current.dispatch.setInitialPrompt(
        "This is a sufficiently descriptive prompt."
      );
    });

    expect(result.current.state.initialPrompt).toBe(
      "This is a sufficiently descriptive prompt."
    );
    expect(result.current.navigation.canGoNext).toBe(true);

    act(() => {
      result.current.navigation.goToNextStep();
    });

    expect(result.current.state.currentStep).toBe("outline");
    expect(result.current.navigation.previousStep).toBe("idea");
  });

  it("generates an outline and clears loading state", async () => {
    const outline: ContentOutline = {
      ...initialWorkflowState.contentOutline,
      functionalRequirements: [
        {
          id: "fr-1",
          title: "Requirement",
          description: "Initial requirement",
          priority: "P0",
          userStory: "As a user I need a feature",
          acceptanceCriteria: ["Criteria"],
          dependencies: [],
        },
      ],
    };

    mockGenerate.mockResolvedValueOnce(outline);

    const { result } = renderHook(() => useStructuredWorkflow());

    await act(async () => {
      await result.current.generateContentOutlineForPrompt("prompt");
    });

    expect(mockGenerate).toHaveBeenCalledWith("prompt");
    expect(
      result.current.state.contentOutline.functionalRequirements
    ).toHaveLength(1);
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeUndefined();
  });

  it("captures errors from outline generation", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mockGenerate.mockRejectedValueOnce(new Error("Network failure"));

    const { result } = renderHook(() => useStructuredWorkflow());

    await act(async () => {
      await result.current.generateContentOutlineForPrompt("prompt");
    });

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBe("Network failure");

    consoleSpy.mockRestore();
  });
});
