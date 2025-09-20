import React from "react";

import { Button } from "@/components/ui/button";
import type { AgenticWorkflowState } from "@/hooks/useAgenticWorkflow";
import type { StructuredOutline } from "@/lib/agents/types";

import { OutlineEditor } from "../OutlineEditor";

interface OutlinePhaseProps {
  state: AgenticWorkflowState;
  onEdit: (outline: StructuredOutline) => void;
  onGenerate: () => void;
  onEditBrief: () => void;
}

export function OutlinePhase({
  state,
  onEdit,
  onGenerate,
  onEditBrief,
}: OutlinePhaseProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 2: Review & Edit Outline</h2>
      <p className="text-gray-600">
        The AI has generated a PRD outline. You can edit section titles and add
        notes before generating the draft.
      </p>
      {state.outline && (
        <OutlineEditor
          outline={state.outline}
          onChange={onEdit}
          isLoading={state.isLoading}
        />
      )}
      <div className="flex gap-2">
        <Button
          onClick={onGenerate}
          disabled={!state.outline || state.isLoading}
        >
          {state.isLoading ? "Generating Draft..." : "Generate PRD Draft"}
        </Button>
        <Button variant="outline" onClick={onEditBrief}>
          Edit Brief
        </Button>
      </div>
    </div>
  );
}
