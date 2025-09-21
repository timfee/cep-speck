"use client";

import { ArrowLeft, ArrowRight, RotateCcw, Wand2 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressTimeline } from "@/components/workflow/ProgressTimeline";
import { CompleteStep } from "@/components/workflow/steps/CompleteStep";
import { ContentOutlineStep } from "@/components/workflow/steps/ContentOutlineStep";
import { GenerateStep } from "@/components/workflow/steps/GenerateStep";
import { IdeaCaptureStep } from "@/components/workflow/steps/IdeaCaptureStep";
import { MIN_PROMPT_LENGTH } from "@/hooks/progressCalculationHelpers";
import { useStructuredWorkflow } from "@/hooks/useStructuredWorkflow";

export function StructuredPrdWizard() {
  const {
    state,
    setBrief,
    setOutline,
    addSection,
    updateSection,
    removeSection,
    moveSection,
    setError,
    generateOutline,
    generateDraft,
    goToNextStep,
    goToPreviousStep,
    resetWorkflow,
  } = useStructuredWorkflow();

  const handleRegenerateOutline = React.useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void (async () => {
      try {
        await generateOutline();
      } catch (error) {
        console.warn("Structured workflow async error", error);
      }
    })();
  }, [generateOutline]);

  const handleGeneratePrd = React.useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void (async () => {
      try {
        await generateDraft();
      } catch (error) {
        console.warn("Structured workflow async error", error);
      }
    })();
  }, [generateDraft]);

  // Auto-generate content outline when prompt is ready and we're on outline step
  React.useEffect(() => {
    if (
      state.currentStep === "outline" &&
      state.brief.trim().length > MIN_PROMPT_LENGTH &&
      (state.outline?.sections.length ?? 0) === 0 &&
      !state.isLoading
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      void (async () => {
        try {
          await generateOutline();
        } catch (error) {
          console.warn("Structured workflow async error", error);
        }
      })();
    }
  }, [
    state.currentStep,
    state.brief,
    state.outline?.sections.length,
    state.isLoading,
    generateOutline,
  ]);

  const handleNext = React.useCallback(() => {
    if (!state.progress.canGoNext) {
      return;
    }

    if (state.currentStep === "idea") {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      void (async () => {
        try {
          await generateOutline();
          goToNextStep();
        } catch (error) {
          console.warn("Structured workflow async error", error);
        }
      })();
      return;
    }

    goToNextStep();
  }, [
    state.progress.canGoNext,
    state.currentStep,
    generateOutline,
    goToNextStep,
  ]);

  React.useEffect(() => {
    if (
      state.currentStep === "generate" &&
      state.finalDraft.trim().length > 0 &&
      !state.isLoading &&
      state.status === "idle" &&
      state.progress.canGoNext
    ) {
      goToNextStep();
    }
  }, [
    state.currentStep,
    state.finalDraft,
    state.isLoading,
    state.status,
    state.progress.canGoNext,
    goToNextStep,
  ]);

  const renderStepContent = () => {
    switch (state.currentStep) {
      case "idea":
        return <IdeaCaptureStep prompt={state.brief} onChange={setBrief} />;

      case "outline":
        return (
          <ContentOutlineStep
            brief={state.brief}
            outline={state.outline}
            onUpdateSection={updateSection}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onMoveSection={moveSection}
            onRegenerateOutline={handleRegenerateOutline}
            isLoading={state.isLoading}
          />
        );

      case "generate":
        return (
          <GenerateStep
            error={state.error ?? null}
            status={state.status}
            isBusy={state.isLoading}
            generatedPrd={state.draft}
            evaluationReport={state.evaluationReport}
            iteration={state.iteration}
            onGenerate={handleGeneratePrd}
            onReset={() => {
              setOutline({
                sections: [...(state.outline?.sections ?? [])],
              });
              setError(undefined);
            }}
          />
        );

      case "complete":
        return (
          <CompleteStep
            generatedPrd={state.finalDraft}
            evaluationReport={state.evaluationReport}
            refinementLimitReached={
              state.error ===
              "Reached refinement limit. Review remaining issues."
            }
          />
        );

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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRegenerateOutline}
                disabled={state.isLoading}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Regenerate Outline
              </Button>
              <Button
                variant="ghost"
                onClick={() => setOutline({ sections: [] })}
                disabled={state.isLoading}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Outline
              </Button>
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={state.isLoading || !state.progress.canGoNext}
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
