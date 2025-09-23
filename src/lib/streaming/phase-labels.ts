import type { StreamPhase } from "@/lib/spec/types";

const TRACKED_PHASES: StreamPhase[] = [
  "generating",
  "validating",
  "evaluating",
  "healing",
];

const PHASE_LABELS: Partial<Record<StreamPhase, string>> = {
  "loading-knowledge": "Loading",
  "performing-research": "Research",
  generating: "Generating",
  validating: "Validating",
  evaluating: "Evaluating",
  healing: "Refining",
  "self-reviewing": "Self review",
  done: "Complete",
  failed: "Failed",
  error: "Error",
};

const TIMELINE_LABELS: Partial<Record<StreamPhase, string>> = {
  "loading-knowledge": "Loading knowledge",
  "performing-research": "Researching context",
  generating: "Generating draft",
  validating: "Validating output",
  evaluating: "Evaluating quality",
  healing: "Refining draft",
  "self-reviewing": "Self review",
};

export function formatPhaseLabel(phase: StreamPhase): string {
  return PHASE_LABELS[phase] ?? phase;
}

export function getTimelinePhaseLabel(phase: StreamPhase): string {
  return TIMELINE_LABELS[phase] ?? formatPhaseLabel(phase);
}

type PhaseStatusRecord = {
  attempts: number;
  issues: number;
  lastMessage?: string;
};

export function summarizePhaseStatus(
  phaseStatus: Partial<Record<StreamPhase, PhaseStatusRecord>> = {}
) {
  return TRACKED_PHASES.flatMap((phase) => {
    const status = phaseStatus[phase];
    const attempts = status?.attempts ?? 0;
    const issues = status?.issues ?? 0;
    const message = status?.lastMessage;

    if (attempts === 0 && issues === 0 && typeof message !== "string") {
      return [] as const;
    }

    return [
      {
        key: phase,
        label: formatPhaseLabel(phase),
        attempts,
        issues,
        message,
      },
    ];
  });
}
