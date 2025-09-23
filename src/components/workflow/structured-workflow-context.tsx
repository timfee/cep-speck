"use client";

import React, { createContext, useContext, type ReactNode } from "react";

import { useStructuredWorkflow } from "@/hooks/use-structured-workflow";

import type {
  StructuredWorkflowState,
  WorkflowStep,
  ContentOutline,
  EnterpriseParameters,
  FunctionalRequirement,
  SuccessMetric,
  Milestone,
  OutlineMetadata,
  CustomerJourney,
  SuccessMetricSchema,
  SerializedWorkflowOutline,
  SerializedWorkflowSpec,
} from "@/types/workflow";

// Define the context type
interface StructuredWorkflowContextType {
  state: StructuredWorkflowState;
  setInitialPrompt: (prompt: string) => void;
  setContentOutline: (outline: ContentOutline) => void;
  setEnterpriseParameters: (params: EnterpriseParameters) => void;
  updateFunctionalRequirement: (
    id: string,
    updates: Partial<FunctionalRequirement>
  ) => void;
  deleteFunctionalRequirement: (id: string) => void;
  addFunctionalRequirement: (requirement: FunctionalRequirement) => void;
  updateSuccessMetric: (id: string, updates: Partial<SuccessMetric>) => void;
  deleteSuccessMetric: (id: string) => void;
  addSuccessMetric: (metric: SuccessMetric) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  addMilestone: (milestone: Milestone) => void;
  updateOutlineMetadata: (updates: Partial<OutlineMetadata>) => void;
  updateCustomerJourney: (
    id: string,
    updates: Partial<CustomerJourney>
  ) => void;
  deleteCustomerJourney: (id: string) => void;
  addCustomerJourney: (journey: CustomerJourney) => void;
  updateMetricSchema: (
    id: string,
    updates: Partial<SuccessMetricSchema>
  ) => void;
  deleteMetricSchema: (id: string) => void;
  addMetricSchema: (schema: SuccessMetricSchema) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: WorkflowStep) => void;
  resetWorkflow: () => void;
  generateContentOutlineForPrompt: (prompt: string) => Promise<void>;
  serializeToSpecPayload: () => SerializedWorkflowSpec;
  serializeToLegacySpecText: () => string;
  serializeToOutlinePayload: () => SerializedWorkflowOutline;
  setFinalPrd: (prd: string) => void;
}

// Create the context
const StructuredWorkflowContext =
  createContext<StructuredWorkflowContextType | null>(null);

// Provider component
interface StructuredWorkflowProviderProps {
  children: ReactNode;
}

export function StructuredWorkflowProvider({
  children,
}: StructuredWorkflowProviderProps) {
  const workflowData = useStructuredWorkflow();

  return (
    <StructuredWorkflowContext.Provider value={workflowData}>
      {children}
    </StructuredWorkflowContext.Provider>
  );
}

// Hook to use the context
export function useStructuredWorkflowContext(): StructuredWorkflowContextType {
  const context = useContext(StructuredWorkflowContext);
  if (!context) {
    throw new Error(
      "useStructuredWorkflowContext must be used within a StructuredWorkflowProvider. Wrap your component tree with <StructuredWorkflowProvider>."
    );
  }
  return context;
}
