"use client";

import React, { useState, useTransition } from "react";

import { AIProgressModal, type AIProgressStep } from "@/components/ai-progress-modal";
import { APIKeySettings } from "@/components/api-key-settings";

import {
  IdeaStep,
  OutlineStep,
  SettingsStep,
  GenerateStep,
  CompleteStep,
} from "@/components/steps";

import { Card } from "@/components/ui/card";
import { ProgressTimeline, WizardNavigation } from "@/components/wizard";
import { generatePRDContent, generateContentOutline, type AIConfig } from "@/lib/ai";
import { type WorkflowStep, WORKFLOW_STEPS } from "@/lib/utils";

interface PRDData {
  prompt: string;
  outline?: {
    functional_requirements: Array<{
      id: string;
      title: string;
      description: string;
    }>;
    success_metrics: Array<{
      id: string;
      name: string;
      target: string;
    }>;
    milestones: Array<{
      id: string;
      title: string;
      timeline: string;
    }>;
  };
  settings?: Record<string, unknown>;
  prd?: {
    title: string;
    overview: string;
    objectives: string[];
    requirements: Array<{
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
    }>;
    timeline: string;
    success_metrics: string[];
  };
}

export function PRDWizard() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("idea");
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);
  const [data, setData] = useState<PRDData>({ prompt: "" });
  const [isPending, startTransition] = useTransition();
  
  // AI Configuration
  const [aiConfig, setAIConfig] = useState<AIConfig>({});
  
  // Progress Modal State
  const [progressSteps, setProgressSteps] = useState<AIProgressStep[]>([]);
  const [currentProgressStep, setCurrentProgressStep] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const canGoNext = () => {
    switch (currentStep) {
      case "idea":
        return data.prompt.trim().length > 10;
      case "outline":
        return data.outline != null;
      case "settings":
        return true; // Optional step
      case "generate":
        return data.prd != null;
      case "complete":
        return false; // No next step after complete
      default:
        return false;
    }
  };

  const canGoBack = () => {
    return currentStep !== "idea";
  };

  const handleNext = () => {
    if (!canGoNext()) return;

    // Mark current step as complete
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    // Move to next step
    const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      const nextStep = WORKFLOW_STEPS[currentIndex + 1].id;
      setCurrentStep(nextStep);

      // Auto-generate content for certain steps
      if (nextStep === "outline" && !data.outline) {
        handleGenerateOutline();
      }
      if (nextStep === "generate" && !data.prd) {
        handleGeneratePRD();
      }
    }
  };

  const handleBack = () => {
    const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = WORKFLOW_STEPS[currentIndex - 1].id;
      setCurrentStep(prevStep);
    }
  };

  const handleStartOver = () => {
    setCurrentStep("idea");
    setCompletedSteps([]);
    setData({ prompt: "" });
  };

  const handleGenerateOutline = () => {
    if (!data.prompt) return;

    setShowProgressModal(true);
    setProgressSteps([
      { type: "input", message: "Processing your product concept...", completed: false },
      { type: "rag", message: "Researching market context and best practices...", completed: false },
      { type: "thinking", message: "Structuring requirements and milestones...", completed: false },
      { type: "output", message: "Generating outline...", completed: false },
    ]);
    setCurrentProgressStep(0);

    startTransition(async () => {
      const result = await generateContentOutline(
        data.prompt, 
        aiConfig,
        (step: string, message: string) => {
          setProgressSteps(prev => {
            const newSteps = [...prev];
            const stepIndex = newSteps.findIndex(s => s.type === step);
            if (stepIndex !== -1) {
              // Mark previous steps as completed
              for (let i = 0; i < stepIndex; i++) {
                newSteps[i].completed = true;
              }
              // Update current step
              newSteps[stepIndex].message = message;
              setCurrentProgressStep(stepIndex);
            }
            return newSteps;
          });
        }
      );
      
      // Mark all steps as completed
      setProgressSteps(prev => prev.map(s => ({ ...s, completed: true })));
      
      setTimeout(() => {
        setShowProgressModal(false);
        if (result.success) {
          setData((prev) => ({ ...prev, outline: result.data }));
        } else {
          console.error("Failed to generate outline:", result.error);
        }
      }, 1000);
    });
  };

  const handleGeneratePRD = () => {
    if (!data.prompt) return;

    setShowProgressModal(true);
    setProgressSteps([
      { type: "input", message: "Processing your product concept...", completed: false },
      { type: "thinking", message: "AI analyzing requirements and generating structured PRD...", completed: false },
      { type: "output", message: "Finalizing PRD document...", completed: false },
    ]);
    setCurrentProgressStep(0);

    startTransition(async () => {
      const result = await generatePRDContent(
        data.prompt, 
        aiConfig,
        (step: string, message: string) => {
          setProgressSteps(prev => {
            const newSteps = [...prev];
            const stepIndex = newSteps.findIndex(s => s.type === step);
            if (stepIndex !== -1) {
              // Mark previous steps as completed
              for (let i = 0; i < stepIndex; i++) {
                newSteps[i].completed = true;
              }
              // Update current step
              newSteps[stepIndex].message = message;
              setCurrentProgressStep(stepIndex);
            }
            return newSteps;
          });
        }
      );
      
      // Mark all steps as completed
      setProgressSteps(prev => prev.map(s => ({ ...s, completed: true })));
      
      setTimeout(() => {
        setShowProgressModal(false);
        if (result.success) {
          setData((prev) => ({ ...prev, prd: result.data }));
        } else {
          console.error("Failed to generate PRD:", result.error);
        }
      }, 1000);
    });
  };

  const renderStepContent = () => {
    const stepProps = {
      data,
      onDataChange: setData,
      isPending,
      onGenerate:
        currentStep === "outline" ? handleGenerateOutline : handleGeneratePRD,
    };

    switch (currentStep) {
      case "idea":
        return <IdeaStep {...stepProps} />;
      case "outline":
        return <OutlineStep {...stepProps} />;
      case "settings":
        return <SettingsStep />;
      case "generate":
        return <GenerateStep {...stepProps} />;
      case "complete":
        return <CompleteStep />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Structured PRD Wizard</h1>
            <p className="text-muted-foreground">
              Create comprehensive PRDs through a guided, step-by-step process
            </p>
          </div>
          <APIKeySettings 
            onSettingsChange={(settings) => {
              setAIConfig({
                apiKey: settings.userApiKey,
                model: settings.model,
              });
            }} 
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <ProgressTimeline
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {renderStepContent()}

          <WizardNavigation
            currentStep={currentStep}
            canGoNext={canGoNext()}
            canGoBack={canGoBack()}
            onNext={handleNext}
            onBack={handleBack}
            onStartOver={handleStartOver}
          />
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        This guided workflow helps you create better PRDs through structured
        input and AI assistance.
      </p>
      
      {/* AI Progress Modal */}
      <AIProgressModal
        open={showProgressModal}
        steps={progressSteps}
        currentStep={currentProgressStep}
        title={currentStep === "outline" ? "Generating Content Outline" : "Generating PRD"}
      />
    </div>
  );
}
