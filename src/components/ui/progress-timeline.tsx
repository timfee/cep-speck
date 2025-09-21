/**
 * Progress timeline component for workflow phases
 */

import { motion } from "framer-motion";
import React from "react";

import { UI_CONSTANTS, RETRY_LIMITS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import {
  PHASE_CONFIG,
  TIMELINE_PHASES,
  type WorkflowPhase,
} from "./workflow-phase-config";

export interface ProgressTimelineProps {
  currentPhase: string;
  attempt: number;
  maxAttempts?: number;
  className?: string;
}

export function ProgressTimeline({
  currentPhase,
  attempt,
  maxAttempts = RETRY_LIMITS.DEFAULT_MAX_ATTEMPTS,
  className,
}: ProgressTimelineProps) {
  const currentIndex = TIMELINE_PHASES.indexOf(currentPhase as WorkflowPhase);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Phase Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Progress
        </span>
        <span className="text-xs text-muted-foreground">
          {attempt}/{maxAttempts} attempts
        </span>
      </div>

      <div className="flex items-center gap-1">
        {TIMELINE_PHASES.map((phase, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const config = PHASE_CONFIG[phase];

          return (
            <div key={phase} className="flex items-center">
              <motion.div
                className={cn(
                  "w-3 h-3 rounded-full border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-green-500 border-green-500"
                    : isActive
                      ? cn(config.borderClasses, config.progressClasses)
                      : "border-gray-300 bg-white"
                )}
                animate={
                  isActive
                    ? { scale: [1, UI_CONSTANTS.ANIMATION_SCALE_BREATHE, 1] }
                    : {}
                }
                transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
              />
              {index < TIMELINE_PHASES.length - 1 && (
                <div
                  className={cn(
                    "w-6 h-0.5 mx-1 transition-colors duration-300",
                    index < currentIndex ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
