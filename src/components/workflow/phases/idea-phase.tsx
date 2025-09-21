import React from "react";

import { Button } from "@/components/ui/button";
import type { AgenticWorkflowState } from "@/hooks/use-agentic-workflow";

interface IdeaPhaseProps {
  state: AgenticWorkflowState;
  setBrief: (brief: string) => void;
  onSubmit: () => void;
}

export function IdeaPhase({ state, setBrief, onSubmit }: IdeaPhaseProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 1: Describe Your Product Idea</h2>
      <p className="text-gray-600">
        Enter a brief description of your product concept. The AI will generate
        a structured outline for your PRD.
      </p>
      <textarea
        className="w-full h-32 p-3 border border-gray-300 rounded-md"
        placeholder="e.g., A tool to manage browser bookmarks for enterprise teams with advanced security and compliance features..."
        value={state.brief}
        onChange={(e) => setBrief(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={!state.brief.trim() || state.isLoading}
        >
          {state.isLoading ? "Generating Outline..." : "Generate Outline"}
        </Button>
      </div>
    </div>
  );
}
