import React from "react";

import { Button } from "@/components/ui/button";
import type { AgenticWorkflowState } from "@/hooks/useAgenticWorkflow";

interface ErrorPhaseProps {
  state: AgenticWorkflowState;
  onReset: () => void;
}

export function ErrorPhase({ state, onReset }: ErrorPhaseProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-red-600">❌ Error</h2>
      <p className="text-red-600">{state.error}</p>
      <div className="flex gap-2">
        <Button onClick={handleRetry}>Retry</Button>
        <Button variant="outline" onClick={onReset}>
          Start Over
        </Button>
      </div>
    </div>
  );
}
