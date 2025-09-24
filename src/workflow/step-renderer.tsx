import React from "react";

import { CompleteStep } from "@/workflow/steps/complete-step";
import { ContentOutlineStep } from "@/workflow/steps/content-outline-step";
import { EnterpriseParametersStep } from "@/workflow/steps/enterprise-parameters-step";
import { GenerateStep } from "@/workflow/steps/generate-step";
import { IdeaCaptureStep } from "@/workflow/steps/idea-capture-step";

import { useStructuredWorkflowContext } from "./structured-workflow-context";

interface StepRendererProps {
  handleRegenerateOutline: () => Promise<void>;
}

export function StepRenderer({ handleRegenerateOutline }: StepRendererProps) {
  const {
    state,
    dispatch,
    updateFunctionalRequirement,
    deleteFunctionalRequirement,
    addFunctionalRequirement,
    updateSuccessMetric,
    deleteSuccessMetric,
    addSuccessMetric,
    updateMilestone,
    deleteMilestone,
    addMilestone,
    updateOutlineMetadata,
    updateCustomerJourney,
    deleteCustomerJourney,
    addCustomerJourney,
    updateMetricSchema,
    deleteMetricSchema,
    addMetricSchema,
  } = useStructuredWorkflowContext();

  const { setInitialPrompt, setContentOutline, setEnterpriseParameters } =
    dispatch;

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
          onUpdateMetadata={updateOutlineMetadata}
          onEditCustomerJourney={updateCustomerJourney}
          onDeleteCustomerJourney={deleteCustomerJourney}
          onAddCustomerJourney={addCustomerJourney}
          onEditMetricSchema={updateMetricSchema}
          onDeleteMetricSchema={deleteMetricSchema}
          onAddMetricSchema={addMetricSchema}
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
      return <CompleteStep generatedPrd={state.finalPrd} />;

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
