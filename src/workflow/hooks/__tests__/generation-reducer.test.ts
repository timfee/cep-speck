import {
  generationReducer,
  createGenerationState,
} from "../generation-reducer";

describe("generationReducer", () => {
  it("resets state and marks generation in progress when beginning", () => {
    const populatedState = createGenerationState({
      generatedPrd: "previous",
      isGenerating: false,
      phase: "healing",
      progress: 45,
      attempt: 3,
      validationIssues: [
        {
          id: "1",
          itemId: "item",
          severity: "error",
          message: "Bad",
        },
      ],
      error: "Something went wrong",
      phaseStatus: {
        healing: { attempts: 2, issues: 1, lastMessage: "Retry" },
      },
    });

    const nextState = generationReducer(populatedState, {
      type: "BEGIN_GENERATION",
    });

    expect(nextState.isGenerating).toBe(true);
    expect(nextState.generatedPrd).toBe("");
    expect(nextState.phase).toBe("");
    expect(nextState.progress).toBe(0);
    expect(nextState.attempt).toBe(0);
    expect(nextState.validationIssues).toEqual([]);
    expect(nextState.error).toBeNull();
    expect(nextState.phaseStatus).toEqual({});
  });

  it("completes generation and sets final phase", () => {
    const baseState = createGenerationState({ isGenerating: true });

    const nextState = generationReducer(baseState, {
      type: "COMPLETE_GENERATION",
      draft: "final draft",
    });

    expect(nextState.generatedPrd).toBe("final draft");
    expect(nextState.phase).toBe("done");
    expect(nextState.progress).toBe(100);
    expect(nextState.isGenerating).toBe(true);
  });

  it("increments phase attempts while preserving last message", () => {
    const baseState = createGenerationState();
    const firstUpdate = generationReducer(baseState, {
      type: "UPDATE_PHASE_STATUS",
      phase: "generating",
      attempt: undefined,
      message: "Starting",
    });
    const secondUpdate = generationReducer(firstUpdate, {
      type: "UPDATE_PHASE_STATUS",
      phase: "generating",
      attempt: undefined,
    });

    expect(firstUpdate.phaseStatus.generating).toEqual({
      attempts: 1,
      issues: 0,
      lastMessage: "Starting",
    });
    expect(secondUpdate.phaseStatus.generating).toEqual({
      attempts: 2,
      issues: 0,
      lastMessage: "Starting",
    });
  });

  it("applies refined draft and updates healing status", () => {
    const baseState = createGenerationState({
      isGenerating: true,
      phaseStatus: {
        validating: { attempts: 2, issues: 3, lastMessage: "Needs fixes" },
        healing: { attempts: 0, issues: 1, lastMessage: "Retry" },
      },
    });

    const nextState = generationReducer(baseState, {
      type: "APPLY_REFINED_DRAFT",
      draft: "refined",
    });

    expect(nextState.generatedPrd).toBe("refined");
    expect(nextState.isGenerating).toBe(false);
    expect(nextState.phase).toBe("done");
    expect(nextState.progress).toBe(100);
    expect(nextState.validationIssues).toEqual([]);
    expect(nextState.phaseStatus.validating).toEqual({
      attempts: 2,
      issues: 0,
      lastMessage: "Needs fixes",
    });
    expect(nextState.phaseStatus.healing).toEqual({
      attempts: 1,
      issues: 1,
      lastMessage: "Refinement applied",
    });
  });
});
