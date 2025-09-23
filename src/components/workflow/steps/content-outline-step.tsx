"use client";

import React from "react";

import type {
  ContentOutline,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
} from "@/types/workflow";

import { CompletionStatus } from "./components/completion-status";
import { ContentSections } from "./components/content-sections";
import { OutlineHeader } from "./components/outline-header";
import { getOutlineSummary } from "./content-outline-helpers";
import { useOutlineStepHandlers } from "./hooks/use-outline-step-handlers";

interface ContentOutlineStepProps {
  initialPrompt: string;
  contentOutline: ContentOutline;
  onChange: (outline: ContentOutline) => void;
  onRegenerateOutline: () => void;
  isLoading?: boolean;
  // Editing functions
  onEditFunctionalRequirement?: (
    id: string,
    updates: Partial<FunctionalRequirement>
  ) => void;
  onDeleteFunctionalRequirement?: (id: string) => void;
  onAddFunctionalRequirement?: (requirement: FunctionalRequirement) => void;
  onEditSuccessMetric?: (id: string, updates: Partial<SuccessMetric>) => void;
  onDeleteSuccessMetric?: (id: string) => void;
  onAddSuccessMetric?: (metric: SuccessMetric) => void;
  onEditMilestone?: (id: string, updates: Partial<Milestone>) => void;
  onDeleteMilestone?: (id: string) => void;
  onAddMilestone?: (milestone: Milestone) => void;
}

export function ContentOutlineStep({
  initialPrompt,
  contentOutline,
  onChange,
  onRegenerateOutline,
  isLoading = false,
  onEditFunctionalRequirement,
  onDeleteFunctionalRequirement,
  onAddFunctionalRequirement,
  onEditSuccessMetric,
  onDeleteSuccessMetric,
  onAddSuccessMetric,
  onEditMilestone,
  onDeleteMilestone,
  onAddMilestone,
}: ContentOutlineStepProps) {
  const outlineSummary = getOutlineSummary(contentOutline);

  const outlineHandlers: ReturnType<typeof useOutlineStepHandlers> =
    useOutlineStepHandlers({
      contentOutline,
      onChange,
      onAddFunctionalRequirement,
      onEditFunctionalRequirement,
      onAddSuccessMetric,
      onEditSuccessMetric,
      onAddMilestone,
      onEditMilestone,
    });

  const {
    handleAddFunctionalRequirement,
    handleEditFunctionalRequirement,
    handleAddSuccessMetric,
    handleEditSuccessMetric,
    handleAddMilestone,
    handleEditMilestone,
    editorState,
    cancelEditor,
    submitEditor,
  } = outlineHandlers;

  return (
    <div className="space-y-6">
      <OutlineHeader
        initialPrompt={initialPrompt}
        outlineSummary={outlineSummary}
        onRegenerateOutline={onRegenerateOutline}
        isLoading={isLoading}
      />

      <ContentSections
        contentOutline={contentOutline}
        handleAddFunctionalRequirement={handleAddFunctionalRequirement}
        handleEditFunctionalRequirement={handleEditFunctionalRequirement}
        onDeleteFunctionalRequirement={onDeleteFunctionalRequirement}
        handleAddSuccessMetric={handleAddSuccessMetric}
        handleEditSuccessMetric={handleEditSuccessMetric}
        onDeleteSuccessMetric={onDeleteSuccessMetric}
        handleAddMilestone={handleAddMilestone}
        handleEditMilestone={handleEditMilestone}
        onDeleteMilestone={onDeleteMilestone}
        editorState={editorState}
        onCancelEditor={cancelEditor}
        onSubmitEditor={submitEditor}
      />

      <CompletionStatus totalItems={outlineSummary.totalItems} />
    </div>
  );
}
