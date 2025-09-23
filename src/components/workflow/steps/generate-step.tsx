import { useCallback } from "react";

import { useStructuredWorkflowContext } from "@/contexts/structured-workflow-context";
import { getPhaseDescription } from "@/lib/streaming/stream-processor";

import {
  GenerationStatusCard,
  ValidationIssuesAlert,
  ErrorAlert,
  SuccessAlert,
  GenerateActions,
  PrdPreview,
} from "./generate-step-sections";

import { usePrdGeneration } from "../hooks/use-prd-generation";

export function GenerateStep() {
  const { state, goToNextStep, setFinalPrd } = useStructuredWorkflowContext();

  // Create a callback that persists the PRD and navigates
  const handleGenerationComplete = useCallback(
    (draft: string) => {
      setFinalPrd(draft);
      goToNextStep();
    },
    [setFinalPrd, goToNextStep]
  );

  const {
    generatedPrd,
    isGenerating,
    phase,
    progress,
    attempt,
    validationIssues,
    error,
    generatePrd,
  } = usePrdGeneration(handleGenerationComplete);

  const handleGenerate = useCallback(async () => {
    await generatePrd(state);
  }, [generatePrd, state]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedPrd);
    } catch (copyError) {
      console.error("Failed to copy to clipboard:", copyError);
    }
  }, [generatedPrd]);

  const hasGeneratedPrd = generatedPrd.length > 0;
  const hasError = typeof error === "string" && error.length > 0;
  const showSuccess = hasGeneratedPrd && !isGenerating && !hasError;
  const showGenerate = !isGenerating && !hasGeneratedPrd;
  const showRegenerate = !isGenerating && hasGeneratedPrd;
  const phaseDescription = getPhaseDescription(phase);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Generate PRD</h2>
        <p className="text-muted-foreground">
          Transform your structured input into a complete PRD document using the
          hybrid AI workflow.
        </p>
      </div>

      <GenerationStatusCard
        isGenerating={isGenerating}
        phase={phase}
        attempt={attempt}
        progress={progress}
        phaseDescription={phaseDescription}
      />

      <ValidationIssuesAlert issues={validationIssues} />

      <ErrorAlert message={error} />

      <SuccessAlert
        shouldShow={showSuccess}
        hasValidationIssues={validationIssues.length > 0}
      />

      <GenerateActions
        showGenerate={showGenerate}
        showRegenerate={showRegenerate}
        onGenerate={handleGenerate}
      />

      <PrdPreview content={generatedPrd} onCopy={copyToClipboard} />
    </div>
  );
}
