/**
 * Phase processing utilities and labels
 * Consolidated from lib/streaming/phase-labels.ts
 */

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

/**
 * Progress mapping for different workflow phases
 */
export const PHASE_PROGRESS_MAP: Record<string, number> = {
  "loading-knowledge": 10,
  "performing-research": 20,
  generating: 40,
  validating: 60,
  evaluating: 70,
  "self-reviewing": 75,
  healing: 85,
  done: 100,
  failed: 0,
  error: 0,
};

/**
 * Human-readable descriptions for each phase
 */
export const PHASE_DESCRIPTIONS: Record<string, string> = {
  "loading-knowledge": "Loading knowledge base...",
  "performing-research": "Researching competitors...",
  generating: "Creating PRD content...",
  validating: "Checking content quality...",
  evaluating: "Analyzing semantic coherence...",
  "self-reviewing": "Performing self review...",
  healing: "Refining and fixing issues...",
  done: "PRD generation complete!",
  failed: "Generation failed",
  error: "An error occurred during processing",
};

export function getProgressForPhase(phase: string): number {
  return PHASE_PROGRESS_MAP[phase] || 0;
}

export function getPhaseDescription(phase: string): string {
  return PHASE_DESCRIPTIONS[phase] || "Processing...";
}
