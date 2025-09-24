"use client";

import React from "react";

import { Card } from "@/components/ui/card";
import { ProgressTimeline } from "@/workflow/progress-timeline";
import { StepRenderer } from "@/workflow/step-renderer";
import { WizardNavigation } from "@/workflow/wizard-navigation";

import { PrdGenerationProvider } from "./hooks/prd-generation-context";
import { usePrdGenerationState } from "./hooks/prd-generation-context";
import { useAutoGeneration } from "./hooks/use-auto-generation";

import {
  StructuredWorkflowProvider,
  useStructuredWorkflowContext,
} from "./structured-workflow-context";

function StructuredPrdWizardContent() {
  const { state, generateContentOutlineForPrompt } =
    useStructuredWorkflowContext();
  const generationState = usePrdGenerationState();

  const [generationAttempted, setGenerationAttempted] = React.useState<
    Set<string>
  >(new Set());

  const handleRegenerateOutline = React.useCallback(async () => {
    setGenerationAttempted(new Set());
    await generateContentOutlineForPrompt(state.initialPrompt);
  }, [generateContentOutlineForPrompt, state.initialPrompt]);

  // Auto-generation effect
  useAutoGeneration(generationAttempted, setGenerationAttempted);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Structured PRD Wizard</h1>
          <p className="text-muted-foreground">
            Create comprehensive PRDs through a guided, step-by-step process
          </p>
        </div>
      </div>

      {/* AI Error Alert */}
      {state.error != null && state.error !== "" && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-amber-600 mt-0.5">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">
                  AI Content Generation Failed
                </h3>
                <p className="text-sm text-amber-700 mt-1">{state.error}</p>
                <p className="text-xs text-amber-600 mt-2">
                  Don&apos;t worry - we&apos;ve generated basic content below so
                  you can continue with your PRD. You can manually edit the
                  sections or fix the API configuration and regenerate.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Progress timeline */}
      <Card className="p-4">
        <ProgressTimeline
          progress={state.progress}
          streamingPhase={generationState.phase}
          isGenerating={generationState.isGenerating}
          attempt={generationState.attempt}
          phaseStatus={generationState.phaseStatus}
        />
      </Card>

      {/* Step content */}
      <Card className="p-6 min-h-[600px]">
        <StepRenderer handleRegenerateOutline={handleRegenerateOutline} />
      </Card>

      {/* Navigation */}
      <WizardNavigation handleRegenerateOutline={handleRegenerateOutline} />

      {/* Help text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          This guided workflow helps you create better PRDs through structured
          input and AI assistance.
        </p>
      </div>
    </div>
  );
}

export function StructuredPrdWizard() {
  return (
    <StructuredWorkflowProvider>
      <PrdGenerationProvider>
        <StructuredPrdWizardContent />
      </PrdGenerationProvider>
    </StructuredWorkflowProvider>
  );
}
