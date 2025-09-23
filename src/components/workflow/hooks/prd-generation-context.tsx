"use client";

import {
  createContext,
  useContext,
  type PropsWithChildren,
  useMemo,
} from "react";

import { classifyIssues } from "@/lib/agents/refiner-helpers";
import type { Issue } from "@/lib/spec/types";

import { usePrdGenerationStore } from "./use-prd-generation-store";

interface PrdGenerationContextValue {
  state: ReturnType<typeof usePrdGenerationStore>["state"];
  actions: ReturnType<typeof usePrdGenerationStore>["actions"];
}

const PrdGenerationContext = createContext<PrdGenerationContextValue | null>(
  null
);

export interface PrdGenerationProviderProps extends PropsWithChildren {
  onGenerationComplete?: (draft: string) => void;
}

export function PrdGenerationProvider({
  children,
  onGenerationComplete,
}: PrdGenerationProviderProps) {
  const store = usePrdGenerationStore(onGenerationComplete);

  const value = useMemo<PrdGenerationContextValue>(
    () => ({
      state: store.state,
      actions: store.actions,
    }),
    [store.state, store.actions]
  );

  return (
    <PrdGenerationContext.Provider value={value}>
      {children}
    </PrdGenerationContext.Provider>
  );
}

export function usePrdGenerationContext() {
  const context = useContext(PrdGenerationContext);

  if (!context) {
    throw new Error(
      "usePrdGenerationContext must be used within a PrdGenerationProvider"
    );
  }

  return context;
}

export function usePrdGenerationState() {
  return usePrdGenerationContext().state;
}

export function usePrdGenerationActions() {
  return usePrdGenerationContext().actions;
}

export function useDeterministicIssues(): Issue[] {
  const {
    state: { validationIssues },
  } = usePrdGenerationContext();

  return useMemo(
    () => classifyIssues(validationIssues).deterministic,
    [validationIssues]
  );
}
