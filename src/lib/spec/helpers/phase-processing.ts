/**
 * Phase processing utilities
 * Uses phase labels and constants from phase-labels.ts
 */

import type { StreamPhase } from "@/lib/spec/types";

import {
  PHASE_LABELS,
  TIMELINE_LABELS,
  PHASE_PROGRESS_MAP,
  PHASE_DESCRIPTIONS,
} from "./phase-labels";

const TRACKED_PHASES: StreamPhase[] = [
  "generating",
  "validating",
  "evaluating",
  "healing",
];

export function formatPhaseLabel(phase: StreamPhase): string {
  return PHASE_LABELS[phase] ?? phase;
}

export function getTimelinePhaseLabel(phase: StreamPhase): string {
  return TIMELINE_LABELS[phase] ?? formatPhaseLabel(phase);
}

export function getProgressForPhase(phase: string): number {
  return PHASE_PROGRESS_MAP[phase] ?? 0;
}

export function getPhaseDescription(phase: string): string {
  return PHASE_DESCRIPTIONS[phase] ?? `Processing ${phase}...`;
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
