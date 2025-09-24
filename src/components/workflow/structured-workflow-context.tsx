"use client";

import React, { createContext, useContext, type ReactNode } from "react";

import {
  useStructuredWorkflow,
  type StructuredWorkflowContextValue,
} from "@/hooks/use-structured-workflow";

// Create the context
const StructuredWorkflowContext =
  createContext<StructuredWorkflowContextValue | null>(null);

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
export function useStructuredWorkflowContext(): StructuredWorkflowContextValue {
  const context = useContext(StructuredWorkflowContext);
  if (!context) {
    throw new Error(
      "useStructuredWorkflowContext must be used within a StructuredWorkflowProvider. Wrap your component tree with <StructuredWorkflowProvider>."
    );
  }
  return context;
}
