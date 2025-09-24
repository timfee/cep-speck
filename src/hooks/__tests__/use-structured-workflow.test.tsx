/** @jest-environment jsdom */

import { act, renderHook } from "@testing-library/react/pure";

import { initialWorkflowState } from "@/lib/utils/workflow-initial-state";
import type { ContentOutline } from "@/types/workflow";

// Mock fetch for API calls
global.fetch = jest.fn();

import { useStructuredWorkflow } from "../use-structured-workflow";

describe("useStructuredWorkflow", () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

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

    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ outline }),
    } as Response);

    const { result } = renderHook(() => useStructuredWorkflow());

    await act(async () => {
      await result.current.generateContentOutlineForPrompt("prompt");
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/content-outline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: "prompt" }),
    });
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

    // Mock failed API response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => useStructuredWorkflow());

    await act(async () => {
      await result.current.generateContentOutlineForPrompt("prompt");
    });

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBe("HTTP error! status: 500");

    consoleSpy.mockRestore();
  });
});
