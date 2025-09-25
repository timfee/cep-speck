import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  cn,
  calculateProgress,
  getStepIndex,
  getStepInfo,
  type WorkflowStep,
  WORKFLOW_STEPS,
} from "@/lib/utils";

interface ProgressTimelineProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
}

export function ProgressTimeline({
  currentStep,
  completedSteps,
}: ProgressTimelineProps) {
  const currentIndex = getStepIndex(currentStep);
  const progress = calculateProgress(currentIndex + 1, WORKFLOW_STEPS.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Progress</h3>
        <div className="text-sm text-muted-foreground">
          Step {currentIndex + 1} of {WORKFLOW_STEPS.length}
        </div>
      </div>

      <Progress value={progress} className="w-full" />

      <p className="text-sm text-muted-foreground">
        {getStepInfo(currentStep)?.name} • {progress}% complete
      </p>

      <div className="flex flex-col space-y-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const isComplete = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPending = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center space-x-4">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  {
                    "bg-primary text-primary-foreground": isCurrent,
                    "bg-green-100 text-green-600": isComplete,
                    "bg-gray-100 text-gray-400": isPending,
                  }
                )}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <h4
                  className={cn("text-sm font-medium", {
                    "text-primary": isCurrent,
                    "text-green-600": isComplete,
                    "text-gray-400": isPending,
                  })}
                >
                  {step.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {isCurrent && <Badge variant="secondary">Current</Badge>}
              {isComplete && (
                <Badge variant="outline" className="text-green-600">
                  Complete
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WizardNavigationProps {
  currentStep: WorkflowStep;
  canGoNext: boolean;
  canGoBack: boolean;
  onNext: () => void;
  onBack: () => void;
  onStartOver: () => void;
}

export function WizardNavigation({
  currentStep,
  canGoNext,
  canGoBack,
  onNext,
  onBack,
  onStartOver,
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={onBack} disabled={!canGoBack}>
          ← Previous
        </Button>
        <Button variant="outline" onClick={onStartOver}>
          Start Over
        </Button>
      </div>

      <div>
        <Button onClick={onNext} disabled={!canGoNext}>
          {currentStep === "complete" ? "Done" : "Next →"}
        </Button>
      </div>
    </div>
  );
}
