/** @jest-environment jsdom */

import { act, renderHook } from "@testing-library/react/pure";

import type { Issue } from "@/lib/spec/types";

import { usePrdGenerationStore } from "../use-prd-generation-store";

const MOCK_ATTEMPT = 2;
const MOCK_PROGRESS = Number("42");

describe("usePrdGenerationStore", () => {
  it("initialises with default state", () => {
    const { result } = renderHook(() => usePrdGenerationStore());

    expect(result.current.state).toMatchObject({
      generatedPrd: "",
      isGenerating: false,
      phase: "",
      progress: 0,
      attempt: 0,
      validationIssues: [],
      error: null,
      phaseStatus: {},
    });
  });

  it("runs through a successful generation lifecycle", () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => usePrdGenerationStore(onComplete));
    const {
      beginGeneration,
      updatePhaseStatus,
      setAttempt,
      setPhase,
      setProgress,
      completeGeneration,
      finishGeneration,
    } = result.current.actions;

    act(() => {
      beginGeneration();
    });

    expect(result.current.state.isGenerating).toBe(true);

    act(() => {
      updatePhaseStatus("generating", undefined, "Streaming");
      setAttempt(MOCK_ATTEMPT);
      setPhase("generating");
      setProgress(MOCK_PROGRESS);
    });

    expect(result.current.state.phase).toBe("generating");
    expect(result.current.state.progress).toBe(MOCK_PROGRESS);
    expect(result.current.state.attempt).toBe(MOCK_ATTEMPT);
    expect(result.current.state.phaseStatus.generating).toEqual({
      attempts: 1,
      issues: 0,
      lastMessage: "Streaming",
    });

    act(() => {
      completeGeneration("draft");
      finishGeneration();
    });

    expect(result.current.state.generatedPrd).toBe("draft");
    expect(result.current.state.phase).toBe("done");
    expect(result.current.state.progress).toBe(100);
    expect(result.current.state.isGenerating).toBe(false);
    expect(onComplete).toHaveBeenCalledWith("draft");
  });

  it("captures validation and healing updates when applying refinement", () => {
    const { result } = renderHook(() => usePrdGenerationStore());
    const {
      beginGeneration,
      setValidationIssues,
      recordPhaseIssues,
      applyRefinedDraft,
    } = result.current.actions;

    const issues: Issue[] = [
      { id: "1", itemId: "item", severity: "error", message: "Problem" },
      { id: "2", itemId: "item", severity: "warn", message: "Minor" },
    ];

    act(() => {
      beginGeneration();
      setValidationIssues(issues);
      recordPhaseIssues("validating", issues);
      applyRefinedDraft("refined draft");
    });

    expect(result.current.state.generatedPrd).toBe("refined draft");
    expect(result.current.state.validationIssues).toEqual([]);
    expect(result.current.state.phase).toBe("done");
    expect(result.current.state.phaseStatus.validating).toEqual({
      attempts: 0,
      issues: 0,
      lastMessage: undefined,
    });
    expect(result.current.state.phaseStatus.healing).toEqual({
      attempts: 1,
      issues: 0,
      lastMessage: "Refinement applied",
    });
  });

  it("records errors and clears them", () => {
    const { result } = renderHook(() => usePrdGenerationStore());
    const { failGeneration, clearError, resetGeneration } =
      result.current.actions;

    act(() => {
      failGeneration("Network error");
    });

    expect(result.current.state.error).toBe("Network error");
    expect(result.current.state.phase).toBe("error");
    expect(result.current.state.progress).toBe(0);

    act(() => {
      clearError();
    });

    expect(result.current.state.error).toBeNull();

    act(() => {
      resetGeneration();
    });

    expect(result.current.state).toMatchObject({
      generatedPrd: "",
      isGenerating: false,
      phase: "",
      progress: 0,
      attempt: 0,
      validationIssues: [],
      error: null,
      phaseStatus: {},
    });
  });
});
