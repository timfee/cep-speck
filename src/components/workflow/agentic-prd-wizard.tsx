import React from "react";

import { useAgenticWorkflow } from "@/hooks/use-agentic-workflow";

import { useWorkflowActions } from "./hooks/use-workflow-actions";
import { renderPhaseContent } from "./utils/phase-registry";

export function AgenticPrdWizard() {
  const workflowHook = useAgenticWorkflow();
  const {
    state,
    setBrief,
    setOutline,
    generateOutline,
    generateDraft,
    resetWorkflow,
  } = workflowHook;

  const {
    handleBriefSubmit,
    handleOutlineEdit,
    handleGenerateDraft,
    handleEditBrief,
  } = useWorkflowActions({
    generateOutline,
    generateDraft,
    setBrief,
    setOutline,
    resetWorkflow,
  });

  const actions = {
    setBrief,
    onBriefSubmit: handleBriefSubmit,
    onOutlineEdit: handleOutlineEdit,
    onGenerateDraft: handleGenerateDraft,
    onEditBrief: handleEditBrief,
    onReset: resetWorkflow,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderPhaseContent(state, actions)}
    </div>
  );
}
