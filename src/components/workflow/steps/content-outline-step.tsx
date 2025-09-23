"use client";

import React from "react";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  OutlineMetadata,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

import { CompletionStatus } from "./components/completion-status";
import { ContentSections } from "./components/content-sections";
import { OutlineHeader } from "./components/outline-header";
import { OutlineMetadataPanel } from "./components/outline-metadata-panel";
import { useOutlineStepHandlers } from "./hooks/use-outline-step-handlers";
import { getOutlineSummary } from "./outline-utils";

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
  onUpdateMetadata?: (updates: Partial<OutlineMetadata>) => void;
  onEditCustomerJourney?: (
    id: string,
    updates: Partial<CustomerJourney>
  ) => void;
  onDeleteCustomerJourney?: (id: string) => void;
  onAddCustomerJourney?: (journey: CustomerJourney) => void;
  onEditMetricSchema?: (
    id: string,
    updates: Partial<SuccessMetricSchema>
  ) => void;
  onDeleteMetricSchema?: (id: string) => void;
  onAddMetricSchema?: (schema: SuccessMetricSchema) => void;
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
  onUpdateMetadata,
  onEditCustomerJourney,
  onDeleteCustomerJourney,
  onAddCustomerJourney,
  onEditMetricSchema,
  onDeleteMetricSchema,
  onAddMetricSchema,
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
      onAddCustomerJourney,
      onEditCustomerJourney,
      onAddMetricSchema,
      onEditMetricSchema,
    });

  const {
    handleAddFunctionalRequirement,
    handleEditFunctionalRequirement,
    handleAddSuccessMetric,
    handleEditSuccessMetric,
    handleAddMilestone,
    handleEditMilestone,
    handleAddCustomerJourney,
    handleEditCustomerJourney,
    handleAddMetricSchema,
    handleEditMetricSchema,
    editorState,
    cancelEditor,
    submitEditor,
  } = outlineHandlers;

  const handleMetadataChange = React.useCallback(
    (updates: Partial<OutlineMetadata>) => {
      if (onUpdateMetadata) {
        onUpdateMetadata(updates);
      } else {
        onChange({
          ...contentOutline,
          metadata: {
            ...contentOutline.metadata,
            ...updates,
          },
        });
      }
    },
    [onUpdateMetadata, onChange, contentOutline]
  );

  return (
    <div className="space-y-6">
      <OutlineHeader
        initialPrompt={initialPrompt}
        outlineSummary={outlineSummary}
        onRegenerateOutline={onRegenerateOutline}
        isLoading={isLoading}
      />

      <OutlineMetadataPanel
        metadata={contentOutline.metadata}
        onChange={handleMetadataChange}
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
        handleAddCustomerJourney={handleAddCustomerJourney}
        handleEditCustomerJourney={handleEditCustomerJourney}
        onDeleteCustomerJourney={onDeleteCustomerJourney}
        handleAddMetricSchema={handleAddMetricSchema}
        handleEditMetricSchema={handleEditMetricSchema}
        onDeleteMetricSchema={onDeleteMetricSchema}
        editorState={editorState}
        onCancelEditor={cancelEditor}
        onSubmitEditor={submitEditor}
      />

      <CompletionStatus totalItems={outlineSummary.totalItems} />
    </div>
  );
}
