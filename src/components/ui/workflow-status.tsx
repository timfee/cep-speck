"use client";

import { motion } from "framer-motion";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { UI_CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { getPhaseConfig } from "./workflow-phase-config";

export interface WorkflowStatusProps {
  phase: string;
  attempt?: number;
  streaming?: boolean;
  className?: string;
  showAttempt?: boolean;
}

export function WorkflowStatus({
  phase,
  attempt = 0,
  streaming = false,
  className,
  showAttempt = true,
}: WorkflowStatusProps) {
  const config = getPhaseConfig(phase);
  const { spinner, bgColor, label, description, icon: Icon } = config;

  return (
    <motion.div
      className={cn("space-y-3", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Status Badge */}
      <motion.div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-300",
          bgColor
        )}
        layout
        animate={{
          scale:
            streaming && config.spinner
              ? [1, UI_CONSTANTS.ANIMATION_SCALE_PULSE, 1]
              : 1,
        }}
        transition={{
          duration: 2,
          repeat: streaming && config.spinner ? Infinity : 0,
        }}
        role="status"
        aria-live="polite"
        aria-label={`PRD generation ${phase}, ${description}`}
      >
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {streaming && spinner ? (
            <Spinner variant={spinner} size={20} className="text-current" />
          ) : (
            <Icon className="h-5 w-5" />
          )}

          <div className="flex flex-col">
            <span className="font-medium text-base">{label}</span>
            <span className="text-xs opacity-75">{description}</span>
          </div>
        </div>

        {/* Attempt Counter */}
        {showAttempt && attempt > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto"
          >
            <Badge variant="outline" className="text-xs px-2 py-1">
              Attempt {attempt}
            </Badge>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Re-export the progress timeline component
export {
  ProgressTimeline,
  type ProgressTimelineProps,
} from "./progress-timeline";
