import type { Issue, StreamPhase } from "@/lib/spec/types";

export interface PhaseStatus {
  attempts: number;
  issues: number;
  lastMessage?: string;
}

export interface GenerationState {
  generatedPrd: string;
  isGenerating: boolean;
  phase: string;
  progress: number;
  attempt: number;
  validationIssues: Issue[];
  error: string | null;
  phaseStatus: Partial<Record<StreamPhase, PhaseStatus>>;
}

export type GenerationAction =
  | { type: "BEGIN_GENERATION" }
  | { type: "COMPLETE_GENERATION"; draft: string }
  | { type: "FAIL_GENERATION"; message: string }
  | { type: "FINISH_GENERATION" }
  | { type: "RESET_GENERATION" }
  | { type: "SET_PHASE"; phase: string }
  | { type: "SET_PROGRESS"; progress: number }
  | { type: "SET_ATTEMPT"; attempt: number }
  | { type: "SET_GENERATED_PRD"; draft: string }
  | { type: "SET_VALIDATION_ISSUES"; issues: Issue[] }
  | {
      type: "UPDATE_PHASE_STATUS";
      phase: StreamPhase;
      attempt?: number;
      message?: string;
    }
  | { type: "RECORD_PHASE_ISSUES"; phase: StreamPhase; issues: Issue[] }
  | { type: "APPLY_REFINED_DRAFT"; draft: string }
  | { type: "CLEAR_ERROR" };

const SAFE_MIN_ATTEMPT = 1;

export function createGenerationState(
  overrides: Partial<GenerationState> = {}
): GenerationState {
  return {
    generatedPrd: "",
    isGenerating: false,
    phase: "",
    progress: 0,
    attempt: 0,
    validationIssues: [],
    error: null,
    phaseStatus: {},
    ...overrides,
  };
}

export const initialGenerationState = createGenerationState();

function updatePhaseStatus(
  previous: GenerationState["phaseStatus"],
  phase: StreamPhase,
  attempt: number | undefined,
  message?: string
): GenerationState["phaseStatus"] {
  const prior = previous[phase] ?? { attempts: 0, issues: 0 };
  const normalizedAttempt = attempt ?? prior.attempts + 1;
  const safeAttempt =
    normalizedAttempt <= 0 ? SAFE_MIN_ATTEMPT : normalizedAttempt;

  return {
    ...previous,
    [phase]: {
      attempts: Math.max(prior.attempts, safeAttempt),
      issues: prior.issues,
      lastMessage: message ?? prior.lastMessage,
    },
  };
}

function recordPhaseIssues(
  previous: GenerationState["phaseStatus"],
  phase: StreamPhase,
  issues: Issue[]
): GenerationState["phaseStatus"] {
  const prior = previous[phase] ?? { attempts: 0, issues: 0 };

  return {
    ...previous,
    [phase]: {
      ...prior,
      issues: issues.length,
    },
  };
}

function applyRefinementStatus(
  previous: GenerationState["phaseStatus"]
): GenerationState["phaseStatus"] {
  const validatingStatus = previous["validating"];
  const healingStatus = previous["healing"];

  return {
    ...previous,
    validating: {
      attempts: validatingStatus?.attempts ?? 0,
      issues: 0,
      lastMessage: validatingStatus?.lastMessage,
    },
    healing: {
      attempts: Math.max(healingStatus?.attempts ?? 0, SAFE_MIN_ATTEMPT),
      issues: healingStatus?.issues ?? 0,
      lastMessage: "Refinement applied",
    },
  };
}

export function generationReducer(
  state: GenerationState,
  action: GenerationAction
): GenerationState {
  switch (action.type) {
    case "BEGIN_GENERATION":
      return createGenerationState({
        isGenerating: true,
      });
    case "COMPLETE_GENERATION":
      return {
        ...state,
        generatedPrd: action.draft,
        progress: 100,
        phase: "done",
      };
    case "FAIL_GENERATION":
      return {
        ...state,
        error: action.message,
        phase: "error",
        progress: 0,
      };
    case "FINISH_GENERATION":
      return {
        ...state,
        isGenerating: false,
      };
    case "RESET_GENERATION":
      return createGenerationState();
    case "SET_PHASE":
      return {
        ...state,
        phase: action.phase,
      };
    case "SET_PROGRESS":
      return {
        ...state,
        progress: action.progress,
      };
    case "SET_ATTEMPT":
      return {
        ...state,
        attempt: action.attempt,
      };
    case "SET_GENERATED_PRD":
      return {
        ...state,
        generatedPrd: action.draft,
      };
    case "SET_VALIDATION_ISSUES":
      return {
        ...state,
        validationIssues: [...action.issues],
      };
    case "UPDATE_PHASE_STATUS":
      return {
        ...state,
        phaseStatus: updatePhaseStatus(
          state.phaseStatus,
          action.phase,
          action.attempt,
          action.message
        ),
      };
    case "RECORD_PHASE_ISSUES":
      return {
        ...state,
        phaseStatus: recordPhaseIssues(
          state.phaseStatus,
          action.phase,
          action.issues
        ),
      };
    case "APPLY_REFINED_DRAFT":
      return {
        ...state,
        generatedPrd: action.draft,
        isGenerating: false,
        phase: "done",
        progress: 100,
        validationIssues: [],
        phaseStatus: applyRefinementStatus(state.phaseStatus),
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}
