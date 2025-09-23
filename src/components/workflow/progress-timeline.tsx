"use client";

import React, { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { StreamPhase } from "@/lib/spec/types";
import { cn } from "@/lib/utils";
import { WORKFLOW_STEPS } from "@/types/workflow";
import type { WorkflowProgress } from "@/types/workflow";

import {
  type GeneratePhaseDetails,
  TimelineStep,
  getPhaseLabel,
} from "./progress-timeline-step";

interface ProgressTimelineProps {
  progress: WorkflowProgress;
  className?: string;
  streamingPhase?: string;
  isGenerating?: boolean;
  attempt?: number;
  phaseStatus?: Partial<
    Record<
      StreamPhase,
      { attempts: number; issues: number; lastMessage?: string }
    >
  >;
}

export function ProgressTimeline({
  progress,
  className,
  streamingPhase,
  isGenerating = false,
  attempt,
  phaseStatus,
}: ProgressTimelineProps) {
  const hasStreamingPhase =
    typeof streamingPhase === "string" && streamingPhase.length > 0;

  const activePhaseDetails = useMemo<GeneratePhaseDetails | undefined>(() => {
    if (!hasStreamingPhase) {
      return undefined;
    }

    const status = phaseStatus?.[streamingPhase as StreamPhase];
    return {
      label: status?.lastMessage ?? getPhaseLabel(streamingPhase),
      attempts: status?.attempts ?? attempt,
      issues: status?.issues ?? 0,
    };
  }, [attempt, hasStreamingPhase, phaseStatus, streamingPhase]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Progress</h3>
          <Badge variant="outline" className="text-sm">
            Step {progress.step} of {progress.totalSteps}
          </Badge>
        </div>
        <Progress value={progress.completion} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {progress.stepName} • {Math.round(progress.completion)}% complete
        </p>
      </div>

      <div className="space-y-3">
        {WORKFLOW_STEPS.map((step, index) => (
          <TimelineStep
            key={step.id}
            step={step}
            index={index}
            progress={progress}
            generatePhase={
              step.id === "generate" && isGenerating && hasStreamingPhase
                ? activePhaseDetails
                : undefined
            }
          />
        ))}
      </div>

      {(progress.timeEstimate ?? 0) > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Estimated time remaining: ~{progress.timeEstimate} minutes
        </div>
      )}
    </div>
  );
}
