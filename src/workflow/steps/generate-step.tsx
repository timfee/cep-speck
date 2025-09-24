import { useStructuredWorkflowContext } from "../structured-workflow-context";
import { GenerateStepView } from "./generate-step-view";
import { useGenerateStep } from "../hooks/use-generate-step";

export function GenerateStep() {
  const { state, dispatch, navigation } = useStructuredWorkflowContext();

  const {
    generation: gen,
    deterministicIssues,
    handleGenerate,
    handleRefine,
    isRefining,
    copyToClipboard,
    hasGeneratedPrd,
    showSuccess,
    wordCount,
    phaseDescription,
  } = useGenerateStep({
    workflowState: state,
    onComplete: (draft: string) => {
      dispatch.setFinalPrd(draft);
      navigation.goToNextStep();
    },
  });

  return (
    <GenerateStepView
      generation={{
        isGenerating: gen.isGenerating,
        phase: gen.phase,
        attempt: gen.attempt,
        progress: gen.progress,
        phaseStatus: gen.phaseStatus,
        validationIssues: gen.validationIssues,
        error: gen.error,
        generatedPrd: gen.generatedPrd,
      }}
      deterministicIssues={deterministicIssues}
      onGenerate={handleGenerate}
      onRefine={handleRefine}
      isRefining={isRefining}
      onCopy={copyToClipboard}
      hasGeneratedPrd={hasGeneratedPrd}
      showSuccess={showSuccess}
      wordCount={wordCount}
      phaseDescription={phaseDescription}
    />
  );
}
