"use client";

import { ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressTimeline } from "@/components/workflow/ProgressTimeline";
import { ContentOutlineStep } from "@/components/workflow/steps/ContentOutlineStep";
import { EnterpriseParametersStep } from "@/components/workflow/steps/EnterpriseParametersStep";
import { IdeaCaptureStep } from "@/components/workflow/steps/IdeaCaptureStep";
import {
  useStructuredWorkflow,
  MIN_PROMPT_LENGTH,
} from "@/hooks/useStructuredWorkflow";

interface StructuredPrdWizardProps {
  onTraditionalMode: () => void;
}

export function StructuredPrdWizard({
  onTraditionalMode,
}: StructuredPrdWizardProps) {
  const [generatedPrd, setGeneratedPrd] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  } = useStructuredWorkflow();

  const handleRegenerateOutline = () => {
    generateContentOutlineForPrompt(state.initialPrompt);
  };

  const handleGeneratePrd = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const specText = serializeToSpecText();
      
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ specText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PRD: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body available");
      }

      const reader = response.body.getReader();

      let accumulatedContent = "";
      const decoder = new TextDecoder();

      try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(line => line.trim());

          for (const line of lines) {
            try {
              const frame = JSON.parse(line) as { type: string; data?: { content?: string; draft?: string; message?: string } };
              if (frame.type === "generation" && frame.data?.content != null) {
                accumulatedContent += frame.data.content;
                setGeneratedPrd(accumulatedContent);
              } else if (frame.type === "result" && frame.data?.draft != null) {
                setGeneratedPrd(frame.data.draft);
                accumulatedContent = frame.data.draft;
              } else if (frame.type === "error") {
                throw new Error(frame.data?.message ?? "Generation failed");
              }
            } catch {
              // Skip invalid JSON lines - removed unused parseError variable
              console.warn("Failed to parse streaming line:", line);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Move to completion step
      goToNextStep();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PRD");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate content outline when prompt is ready and we're on outline step
  React.useEffect(() => {
    if (
      state.currentStep === "outline" &&
      state.initialPrompt.trim().length > MIN_PROMPT_LENGTH &&
      state.contentOutline.functionalRequirements.length === 0
    ) {
      generateContentOutlineForPrompt(state.initialPrompt);
    }
  }, [
    state.currentStep,
    state.initialPrompt,
    state.contentOutline.functionalRequirements.length,
    generateContentOutlineForPrompt,
  ]);

  const handleNext = () => {
    if (state.currentStep === "idea" && state.progress.canGoNext) {
      goToNextStep();
    } else if (state.currentStep === "outline" && state.progress.canGoNext) {
      goToNextStep();
    } else if (state.currentStep === "parameters" && state.progress.canGoNext) {
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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Generate PRD</h2>
              <p className="text-muted-foreground mb-6">
                Ready to generate your comprehensive PRD using the consolidated validation system.
              </p>
            </div>
            
            {error != null && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button
                onClick={handleGeneratePrd}
                disabled={isGenerating}
                size="lg"
                className="min-w-48"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate PRD"}
              </Button>
            </div>
            
            {isGenerating && generatedPrd.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Generated Content Preview:</h3>
                <div className="p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{generatedPrd}</pre>
                </div>
              </div>
            )}
          </div>
        );

      case "complete":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">PRD Complete</h2>
              <p className="text-muted-foreground mb-6">
                Your PRD has been successfully generated using the consolidated semantic validation system.
              </p>
            </div>
            
            {generatedPrd.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Final PRD:</h3>
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(generatedPrd)}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{generatedPrd}</pre>
                </div>
              </div>
            )}
          </div>
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
        <Button variant="outline" onClick={onTraditionalMode}>
          Switch to Traditional Mode
        </Button>
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
