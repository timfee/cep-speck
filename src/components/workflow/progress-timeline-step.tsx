"use client";

import { Circle } from "lucide-react";

import { getTimelinePhaseLabel } from "@/lib/streaming/phase-labels";
import { cn } from "@/lib/utils";
import type { WorkflowProgress, WORKFLOW_STEPS } from "@/types/workflow";

import { PhaseBadges, StepIndicator } from "./progress-timeline-visuals";

export type GeneratePhaseDetails = {
  label?: string;
  attempts?: number;
  issues: number;
};

export function getPhaseLabel(phase: string | undefined): string | undefined {
  if (phase === undefined || phase === "") {
    return undefined;
  }
  return getTimelinePhaseLabel(
    phase as Parameters<typeof getTimelinePhaseLabel>[0]
  );
}

interface TimelineStepProps {
  step: (typeof WORKFLOW_STEPS)[number];
  index: number;
  progress: WorkflowProgress;
  generatePhase?: GeneratePhaseDetails;
}

export function TimelineStep({
  step,
  index,
  progress,
  generatePhase,
}: TimelineStepProps) {
  const stepNumber = index + 1;
  const isActive = stepNumber === progress.step;
  const isCompleted = stepNumber < progress.step;
  const isGenerateStep = step.id === "generate";

  const containerClass = cn(
    "flex items-center space-x-3 p-3 rounded-lg transition-all",
    isActive && "bg-primary/5 border border-primary/20",
    isCompleted && "bg-green-50 border border-green-200",
    !isActive && !isCompleted && "bg-gray-50 border border-gray-200"
  );

  const titleClass = cn(
    "text-sm font-medium",
    isActive && "text-primary",
    isCompleted && "text-green-700",
    !isActive && !isCompleted && "text-gray-500"
  );

  const descriptionClass = cn(
    "text-xs",
    isActive && "text-primary/70",
    isCompleted && "text-green-600",
    !isActive && !isCompleted && "text-gray-400"
  );

  return (
    <div className={containerClass}>
      <StepIndicator
        stepNumber={stepNumber}
        isCompleted={isCompleted}
        isActive={isActive}
        showSpinner={Boolean(generatePhase)}
      />

      <div className="flex-1 min-w-0">
        <h4 className={titleClass}>{step.name}</h4>
        <p className={descriptionClass}>{step.description}</p>
        <PhaseBadges details={isGenerateStep ? generatePhase : undefined} />
      </div>

      {isActive ? (
        <div className="flex-shrink-0">
          <Circle className="h-4 w-4 text-primary animate-pulse" />
        </div>
      ) : null}
    </div>
  );
}
