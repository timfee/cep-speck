"use client";

import { Brain, Search, MessageSquare, FileText, Loader2 } from "lucide-react";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Progress } from "@/components/ui/progress";

export type AIThoughtType = "input" | "thinking" | "rag" | "output";

export interface AIProgressStep {
  type: AIThoughtType;
  message: string;
  completed: boolean;
  progress?: number;
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
} as const;

const STEP_COLORS = {
  input: "text-blue-500",
  thinking: "text-purple-500", 
  rag: "text-green-500",
  output: "text-orange-500",
} as const;

const STEP_BACKGROUNDS = {
  input: "bg-blue-50 dark:bg-blue-950/20",
  thinking: "bg-purple-50 dark:bg-purple-950/20",
  rag: "bg-green-50 dark:bg-green-950/20",
  output: "bg-orange-50 dark:bg-orange-950/20",
} as const;

export function AIProgressModal({ 
  open, 
  steps, 
  currentStep = 0, 
  title = "AI Processing" 
}: AIProgressModalProps) {
  const overallProgress = steps.length > 0 ? (steps.filter(s => s.completed).length / steps.length) * 100 : 0;

  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Processing your request with AI assistance...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[step.type];
              const isActive = index === currentStep;
              const isCompleted = step.completed;
              
              return (
                <div
                  key={index}
                  className={`
                    relative p-3 rounded-lg border transition-all duration-200
                    ${isActive ? STEP_BACKGROUNDS[step.type] + " border-current shadow-sm" : ""}
                    ${isCompleted ? "opacity-75" : ""}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      ${isCompleted ? "bg-green-100 dark:bg-green-900/30" : STEP_BACKGROUNDS[step.type]}
                    `}>
                      {isCompleted ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      ) : isActive ? (
                        <Icon className={`h-4 w-4 ${STEP_COLORS[step.type]}`} />
                      ) : (
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`
                          text-sm font-medium capitalize
                          ${isActive ? STEP_COLORS[step.type] : "text-foreground"}
                          ${isCompleted ? "text-muted-foreground" : ""}
                        `}>
                          {step.type}
                        </span>
                        {isActive && !isCompleted && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {step.message}
                      </p>
                      
                      {/* Step-specific progress */}
                      {isActive && step.progress !== undefined && (
                        <Progress value={step.progress} className="h-1 mt-2" />
                      )}
                    </div>
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