"use client";

import React from "react";

import { Card } from "@/components/ui/card";
import { ProgressTimeline } from "@/components/workflow/progress-timeline";
import { StepRenderer } from "@/components/workflow/step-renderer";
import { WizardNavigation } from "@/components/workflow/wizard-navigation";
import { StructuredWorkflowProvider, useStructuredWorkflowContext } from "@/contexts/structured-workflow-context";

import { useAutoGeneration } from "./hooks/use-auto-generation";
import { usePrdWizardHandlers } from "./hooks/use-prd-wizard-handlers";

function StructuredPrdWizardContent() {
  const { state } = useStructuredWorkflowContext();

  const {
    generatedPrd,
    isGenerating,
    error,
    generationAttempted,
    setGenerationAttempted,
    handleRegenerateOutline,
    handleGeneratePrd,
  } = usePrdWizardHandlers();

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

      {/* Progress timeline */}
      <Card className="p-4">
        <ProgressTimeline progress={state.progress} />
      </Card>

      {/* Step content */}
      <Card className="p-6 min-h-[600px]">
        <StepRenderer
          _generatedPrd={generatedPrd}
          _isGenerating={isGenerating}
          _error={error}
          handleRegenerateOutline={handleRegenerateOutline}
          _handleGeneratePrd={handleGeneratePrd}
        />
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
      <StructuredPrdWizardContent />
    </StructuredWorkflowProvider>
  );
}
