"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTimeline } from '@/components/workflow/ProgressTimeline';
import { IdeaCaptureStep } from '@/components/workflow/steps/IdeaCaptureStep';
import { StructureReviewStep } from '@/components/workflow/steps/StructureReviewStep';
import { useStructuredWorkflow, MIN_PROMPT_LENGTH } from '@/hooks/useStructuredWorkflow';
import { ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';

interface StructuredPrdWizardProps {
  onTraditionalMode: () => void;
}

export function StructuredPrdWizard({ onTraditionalMode }: StructuredPrdWizardProps) {
  const {
    state,
    setInitialPrompt,
    setSelectedSections,
    goToNextStep,
    goToPreviousStep,
    resetWorkflow,
    generateStructureForPrompt
  } = useStructuredWorkflow();

  const handleRegenerateStructure = async () => {
    generateStructureForPrompt(state.initialPrompt);
  };

  // Auto-generate structure when prompt is ready and we're on structure step
  React.useEffect(() => {
    if (state.currentStep === 'structure' && state.initialPrompt.trim().length > MIN_PROMPT_LENGTH && state.suggestedSections.length === 0) {
      generateStructureForPrompt(state.initialPrompt);
    }
  }, [state.currentStep, state.initialPrompt, state.suggestedSections.length, generateStructureForPrompt]);

  const handleNext = () => {
    if (state.currentStep === 'idea' && state.progress.canGoNext) {
      goToNextStep();
    } else if (state.currentStep === 'structure' && state.progress.canGoNext) {
      goToNextStep();
    }
    // Add more steps as needed
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'idea':
        return (
          <IdeaCaptureStep
            prompt={state.initialPrompt}
            onChange={setInitialPrompt}
          />
        );
      
      case 'structure':
        return (
          <StructureReviewStep
            initialPrompt={state.initialPrompt}
            suggestedSections={state.suggestedSections}
            selectedSections={state.selectedSections}
            onSelectedSectionsChange={setSelectedSections}
            onRegenerateStructure={handleRegenerateStructure}
            isLoading={state.isLoading}
          />
        );
      
      case 'sections':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Section Editing</h2>
            <p className="text-muted-foreground">
              Section editing interface coming soon...
            </p>
          </div>
        );
      
      case 'generate':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Generate PRD</h2>
            <p className="text-muted-foreground">
              PRD generation interface coming soon...
            </p>
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
      <Card className="p-6 min-h-[600px]">
        {renderStepContent()}
      </Card>

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
          {state.currentStep === 'structure' && (
            <Button
              variant="outline"
              onClick={handleRegenerateStructure}
              disabled={state.isLoading}
              className="flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Regenerate Structure
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
          This guided workflow helps you create better PRDs through structured input and AI assistance.
        </p>
      </div>
    </div>
  );
}