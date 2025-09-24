import { initialWorkflowState } from "@/hooks/workflow-initial-state";
import { resolveNavigationGuards } from "@/hooks/workflow-navigation";

describe("resolveNavigationGuards", () => {
  it("enables forward navigation when progress allows", () => {
    const state = {
      ...initialWorkflowState,
      progress: {
        ...initialWorkflowState.progress,
        canGoNext: true,
        canGoBack: false,
      },
    };

    const guards = resolveNavigationGuards(state);

    expect(guards.nextStep).toBe("outline");
    expect(guards.previousStep).toBeNull();
    expect(guards.canGoNext).toBe(true);
    expect(guards.canGoBack).toBe(false);
  });

  it("disables forward navigation when guards fail", () => {
    const state = {
      ...initialWorkflowState,
      progress: {
        ...initialWorkflowState.progress,
        canGoNext: false,
        canGoBack: false,
      },
    };

    const guards = resolveNavigationGuards(state);

    expect(guards.nextStep).toBe("outline");
    expect(guards.canGoNext).toBe(false);
  });

  it("exposes both directions for interior steps", () => {
    const state = {
      ...initialWorkflowState,
      currentStep: "generate" as const,
      progress: {
        ...initialWorkflowState.progress,
        canGoNext: true,
        canGoBack: true,
      },
    };

    const guards = resolveNavigationGuards(state);

    expect(guards.previousStep).toBe("parameters");
    expect(guards.nextStep).toBe("complete");
    expect(guards.canGoBack).toBe(true);
    expect(guards.canGoNext).toBe(true);
  });
});
