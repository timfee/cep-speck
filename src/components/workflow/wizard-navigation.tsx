import { ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

import { useStructuredWorkflowContext } from "./structured-workflow-context";

interface WizardNavigationProps {
  handleRegenerateOutline: () => Promise<void>;
}

export function WizardNavigation({
  handleRegenerateOutline,
}: WizardNavigationProps) {
  const { state, goToNextStep, goToPreviousStep, resetWorkflow } =
    useStructuredWorkflowContext();

  const handleNext = () => {
    if (state.progress.canGoNext) {
      goToNextStep();
    }
  };

  return (
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
  );
}
