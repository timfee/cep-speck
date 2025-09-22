"use client";

import { ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  processStreamingResponse,
  useGenerationState,
} from "@/components/workflow/hooks/use-generation-state";

import { ProgressTimeline } from "@/components/workflow/progress-timeline";
import { CompleteStep } from "@/components/workflow/steps/complete-step";
import { ContentOutlineStep } from "@/components/workflow/steps/content-outline-step";
import { EnterpriseParametersStep } from "@/components/workflow/steps/enterprise-parameters-step";
import { GenerateStep } from "@/components/workflow/steps/generate-step";
import { IdeaCaptureStep } from "@/components/workflow/steps/idea-capture-step";
import { MIN_PROMPT_LENGTH } from "@/hooks/progress-calculation";
import { useStructuredWorkflow } from "@/hooks/use-structured-workflow";

export function StructuredPrdWizard() {
  const {
    generatedPrd,
    isGenerating,
    error,
    setGeneratedPrd,
    setIsGenerating,
    setError,
  } = useGenerationState();

  const {
    state,
    setInitialPrompt,
    setContentOutline,
    setEnterpriseParameters,
    goToNextStep,
    goToPreviousStep,
    resetWorkflow,
    generateContentOutlineForPrompt,
    serializeToSpecText,
    // Content editing functions
    updateFunctionalRequirement,
    deleteFunctionalRequirement,
    addFunctionalRequirement,
    updateSuccessMetric,
    deleteSuccessMetric,
    addSuccessMetric,
    updateMilestone,
    deleteMilestone,
    addMilestone,
  } = useStructuredWorkflow();

  const handleRegenerateOutline = async () => {
    await generateContentOutlineForPrompt(state.initialPrompt);
  };

  const handleGeneratePrd = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const specText = serializeToSpecText();
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PRD: ${response.statusText}`);
      }

      await processStreamingResponse(
        response,
        setGeneratedPrd,
        setGeneratedPrd
      );

      goToNextStep();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PRD");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate content outline when prompt is ready and we're on outline step
  React.useEffect(() => {
    async function autoGenerateOutline() {
      try {
        await generateContentOutlineForPrompt(state.initialPrompt);
      } catch (error) {
        console.error("Failed to auto-generate content outline:", error);
      }
    }

    if (
      state.currentStep === "outline" &&
      state.initialPrompt.trim().length > MIN_PROMPT_LENGTH &&
      state.contentOutline.functionalRequirements.length === 0 &&
      !state.isLoading
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      autoGenerateOutline();
    }
  }, [
    state.currentStep,
    state.initialPrompt,
    state.contentOutline.functionalRequirements.length,
    state.isLoading,
    generateContentOutlineForPrompt,
  ]);

  const handleNext = () => {
    if (state.progress.canGoNext) {
      goToNextStep();
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case "idea":
        return (
          <IdeaCaptureStep
            prompt={state.initialPrompt}
            onChange={setInitialPrompt}
          />
        );

      case "outline":
        return (
          <ContentOutlineStep
            initialPrompt={state.initialPrompt}
            contentOutline={state.contentOutline}
            onChange={setContentOutline}
            onRegenerateOutline={handleRegenerateOutline}
            isLoading={state.isLoading}
            onEditFunctionalRequirement={updateFunctionalRequirement}
            onDeleteFunctionalRequirement={deleteFunctionalRequirement}
            onAddFunctionalRequirement={addFunctionalRequirement}
            onEditSuccessMetric={updateSuccessMetric}
            onDeleteSuccessMetric={deleteSuccessMetric}
            onAddSuccessMetric={addSuccessMetric}
            onEditMilestone={updateMilestone}
            onDeleteMilestone={deleteMilestone}
            onAddMilestone={addMilestone}
          />
        );

      case "parameters":
        return (
          <EnterpriseParametersStep
            parameters={state.enterpriseParameters}
            onChange={setEnterpriseParameters}
          />
        );

      case "generate":
        return (
          <GenerateStep
            error={error}
            isGenerating={isGenerating}
            generatedPrd={generatedPrd}
            onGenerate={handleGeneratePrd}
          />
        );

      case "complete":
        return <CompleteStep generatedPrd={generatedPrd} />;

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Unknown Step</h2>
            <p className="text-muted-foreground">
              This step is not implemented yet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with mode switch */}
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
      <Card className="p-6 min-h-[600px]">{renderStepContent()}</Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={!state.progress.canGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="ghost"
            onClick={resetWorkflow}
            className="text-muted-foreground"
          >
            Start Over
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {state.currentStep === "outline" && (
            <Button
              variant="outline"
              onClick={handleRegenerateOutline}
              disabled={state.isLoading}
              className="flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Regenerate Outline
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!state.progress.canGoNext}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
