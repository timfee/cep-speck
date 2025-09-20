import React from "react";

import { useAgenticWorkflow } from "@/hooks/useAgenticWorkflow";

import { useWorkflowActions } from "./hooks/useWorkflowActions";
import { renderPhaseContent } from "./utils/phaseRegistry";

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
