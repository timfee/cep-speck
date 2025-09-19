"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import type { WorkflowProgress } from "@/types/workflow";
import { WORKFLOW_STEPS } from "@/types/workflow";

interface ProgressTimelineProps {
  progress: WorkflowProgress;
  className?: string;
}

export function ProgressTimeline({
  progress,
  className,
}: ProgressTimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Progress */}
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

      {/* Step Timeline */}
      <div className="space-y-3">
        {WORKFLOW_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === progress.step;
          const isCompleted = stepNumber < progress.step;
          const isUpcoming = stepNumber > progress.step;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-all",
                isActive && "bg-primary/5 border border-primary/20",
                isCompleted && "bg-green-50 border border-green-200",
                isUpcoming && "bg-gray-50 border border-gray-200"
              )}
            >
              {/* Step indicator */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  "transition-all duration-200",
                  isCompleted && "bg-green-500 text-white",
                  isActive && "bg-primary text-primary-foreground",
                  isUpcoming && "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "text-sm font-medium",
                    isActive && "text-primary",
                    isCompleted && "text-green-700",
                    isUpcoming && "text-gray-500"
                  )}
                >
                  {step.name}
                </h4>
                <p
                  className={cn(
                    "text-xs",
                    isActive && "text-primary/70",
                    isCompleted && "text-green-600",
                    isUpcoming && "text-gray-400"
                  )}
                >
                  {step.description}
                </p>
              </div>

              {/* Current progress indicator */}
              {isActive && (
                <div className="flex-shrink-0">
                  <Circle className="h-4 w-4 text-primary animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time estimates */}
      {progress.timeEstimate && (
        <div className="text-xs text-muted-foreground text-center">
          Estimated time remaining: ~{progress.timeEstimate} minutes
        </div>
      )}
    </div>
  );
}
