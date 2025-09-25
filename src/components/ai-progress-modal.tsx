"use client";

import {
  Brain,
  Search,
  MessageSquare,
  FileText,
  Loader2,
  WrenchIcon,
} from "lucide-react";

import React from "react";

import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type AIThoughtType =
  | "input"
  | "thinking"
  | "rag"
  | "output"
  | "tools"
  | "prompts"
  | "changes";

export interface AIProgressStep {
  type: AIThoughtType;
  message: string;
  completed: boolean;
  progress?: number;
  details?: string;
  timestamp?: Date;
}

interface AIProgressModalProps {
  open: boolean;
  steps: AIProgressStep[];
  currentStep?: number;
  title?: string;
}

const STEP_ICONS = {
  input: FileText,
  thinking: Brain,
  rag: Search,
  output: MessageSquare,
  tools: WrenchIcon,
  prompts: MessageSquare,
  changes: FileText,
} as const;

const STEP_COLORS = {
  input: "text-blue-500",
  thinking: "text-purple-500",
  rag: "text-green-500",
  output: "text-orange-500",
  tools: "text-cyan-500",
  prompts: "text-pink-500",
  changes: "text-yellow-500",
} as const;

const STEP_BACKGROUNDS = {
  input: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  thinking:
    "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
  rag: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  output:
    "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
  tools: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800",
  prompts:
    "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800",
  changes:
    "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
} as const;

const STEP_LABELS = {
  input: "Processing Input",
  thinking: "AI Reasoning",
  rag: "Research & Context",
  output: "Generating Output",
  tools: "Using Tools",
  prompts: "Prompt Engineering",
  changes: "Applying Changes",
} as const;

export function AIProgressModal({
  open,
  steps,
  currentStep = 0,
  title = "AI Processing",
}: AIProgressModalProps) {
  const overallProgress =
    steps.length > 0
      ? (steps.filter((s) => s.completed).length / steps.length) * 100
      : 0;
  const activeStep =
    currentStep < steps.length ? steps[currentStep] : undefined;

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-lg max-h-[80vh] overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            AI is processing your request with structured thinking...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Overall Progress</span>
                {activeStep !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {STEP_LABELS[activeStep.type]}
                  </Badge>
                )}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Active Step Details */}
          {activeStep !== undefined && !activeStep.completed && (
            <div
              className={cn(
                "p-4 rounded-lg border-2 transition-all duration-300",
                STEP_BACKGROUNDS[activeStep.type]
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    "bg-white dark:bg-gray-900 shadow-sm"
                  )}
                >
                  {React.createElement(STEP_ICONS[activeStep.type], {
                    className: cn("h-5 w-5", STEP_COLORS[activeStep.type]),
                  })}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        STEP_COLORS[activeStep.type]
                      )}
                    >
                      {STEP_LABELS[activeStep.type]}
                    </span>
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  </div>

                  <p className="text-sm text-foreground font-medium">
                    {activeStep.message}
                  </p>

                  {activeStep.details && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeStep.details}
                    </p>
                  )}

                  {activeStep.progress !== undefined && (
                    <Progress
                      value={activeStep.progress}
                      className="h-1.5 mt-3"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Completed Steps Timeline */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <span className="text-sm font-medium text-muted-foreground">
              Recent Activity
            </span>

            {steps
              .slice()
              .reverse()
              .map((step, index) => {
                const originalIndex = steps.length - 1 - index;
                const isActive =
                  originalIndex === currentStep && !step.completed;
                const isCompleted = step.completed;

                if (isActive) return null; // Skip active step (shown above)

                return (
                  <div
                    key={originalIndex}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded transition-all duration-200",
                      isCompleted ? "opacity-75 bg-muted/30" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                        isCompleted
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-muted"
                      )}
                    >
                      {isCompleted ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      ) : (
                        React.createElement(STEP_ICONS[step.type], {
                          className: "h-3 w-3 text-muted-foreground",
                        })
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-medium capitalize",
                            isCompleted
                              ? "text-muted-foreground"
                              : STEP_COLORS[step.type]
                          )}
                        >
                          {STEP_LABELS[step.type]}
                        </span>
                        {step.timestamp && (
                          <span className="text-xs text-muted-foreground">
                            {step.timestamp.toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground truncate">
                        {step.message}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
