"use client";

import React from "react";

import { useOutlineStepHandlers } from "@/components/workflow/hooks/use-outline-step-handlers";
import type { EditorKind } from "@/lib/workflow/outline-editor-types";

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
import { getOutlineSummary } from "./content-outline-summary";

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

  const { handlersByKind, editorState, cancelEditor, submitEditor } =
    outlineHandlers;

  const deleteHandlers = React.useMemo<
    Partial<Record<EditorKind, (id: string) => void>>
  >(
    () => ({
      functionalRequirement: onDeleteFunctionalRequirement,
      successMetric: onDeleteSuccessMetric,
      milestone: onDeleteMilestone,
      customerJourney: onDeleteCustomerJourney,
      metricSchema: onDeleteMetricSchema,
    }),
    [
      onDeleteFunctionalRequirement,
      onDeleteSuccessMetric,
      onDeleteMilestone,
      onDeleteCustomerJourney,
      onDeleteMetricSchema,
    ]
  );

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
        handlersByKind={handlersByKind}
        deleteHandlers={deleteHandlers}
        editorState={editorState}
        onCancelEditor={cancelEditor}
        onSubmitEditor={submitEditor}
      />

      <CompletionStatus totalItems={outlineSummary.totalItems} />
    </div>
  );
}
