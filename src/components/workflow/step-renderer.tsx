import React from "react";

import { CompleteStep } from "@/components/workflow/steps/complete-step";
import { ContentOutlineStep } from "@/components/workflow/steps/content-outline-step";
import { EnterpriseParametersStep } from "@/components/workflow/steps/enterprise-parameters-step";
import { GenerateStep } from "@/components/workflow/steps/generate-step";
import { IdeaCaptureStep } from "@/components/workflow/steps/idea-capture-step";
import { useStructuredWorkflow } from "@/hooks/use-structured-workflow";

interface StepRendererProps {
  generatedPrd: string;
  _isGenerating: boolean;
  _error: string | null;
  handleRegenerateOutline: () => Promise<void>;
  _handleGeneratePrd: () => Promise<void>;
}

export function StepRenderer({
  generatedPrd,
  _isGenerating,
  _error,
  handleRegenerateOutline,
  _handleGeneratePrd,
}: StepRendererProps) {
  const {
    state,
    setInitialPrompt,
    setContentOutline,
    setEnterpriseParameters,
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
      return <GenerateStep />;

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
}
