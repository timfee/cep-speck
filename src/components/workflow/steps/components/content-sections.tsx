import React from "react";

import type { ContentOutline } from "@/types/workflow";

import { ContentSection } from "./content-section";
import { SECTION_CONFIGS } from "./content-sections-config";
import type { FormComponentProps } from "./inline-editor-panel";
import { FunctionalRequirementForm } from "../hooks/functional-requirement-form";
import { MilestoneForm } from "../hooks/milestone-form";

import {
  type DraftForKind,
  type EditorKind,
  type EditorState,
  type EditorValues,
  type StateForKind,
} from "../hooks/outline-editor-types";

import { SuccessMetricForm } from "../hooks/success-metric-form";

interface ContentSectionsProps {
  contentOutline: ContentOutline;
  handleAddFunctionalRequirement: () => void;
  handleEditFunctionalRequirement: (id: string) => void;
  onDeleteFunctionalRequirement?: (id: string) => void;
  handleAddSuccessMetric: () => void;
  handleEditSuccessMetric: (id: string) => void;
  onDeleteSuccessMetric?: (id: string) => void;
  handleAddMilestone: () => void;
  handleEditMilestone: (id: string) => void;
  onDeleteMilestone?: (id: string) => void;
  editorState: EditorState | null;
  onCancelEditor: () => void;
  onSubmitEditor: (values: EditorValues) => void;
}

export function ContentSections(props: ContentSectionsProps) {
  const {
    contentOutline,
    handleAddFunctionalRequirement,
    handleEditFunctionalRequirement,
    onDeleteFunctionalRequirement,
    handleAddSuccessMetric,
    handleEditSuccessMetric,
    onDeleteSuccessMetric,
    handleAddMilestone,
    handleEditMilestone,
    onDeleteMilestone,
    editorState,
    onCancelEditor,
    onSubmitEditor,
  } = props;

  const resolveEditorProps = <K extends EditorKind>(
    kind: K
  ): FormComponentProps<DraftForKind<K>> | undefined => {
    if (editorState?.kind !== kind) {
      return undefined;
    }

    const typedState = editorState as StateForKind<K>;
    const initialValues = typedState.data as DraftForKind<K>;
    return {
      mode: typedState.mode,
      initialValues,
      onCancel: onCancelEditor,
      onSubmit: (values: DraftForKind<K>) => onSubmitEditor(values),
    };
  };

  return (
    <>
      <ContentSection
        {...SECTION_CONFIGS.requirements}
        items={contentOutline.functionalRequirements}
        onAdd={handleAddFunctionalRequirement}
        onEdit={handleEditFunctionalRequirement}
        onDelete={onDeleteFunctionalRequirement}
        renderItem={SECTION_CONFIGS.requirements.renderer}
        editor={resolveEditorProps("functionalRequirement")}
        FormComponent={FunctionalRequirementForm}
      />
      <ContentSection
        {...SECTION_CONFIGS.metrics}
        items={contentOutline.successMetrics}
        onAdd={handleAddSuccessMetric}
        onEdit={handleEditSuccessMetric}
        onDelete={onDeleteSuccessMetric}
        renderItem={SECTION_CONFIGS.metrics.renderer}
        editor={resolveEditorProps("successMetric")}
        FormComponent={SuccessMetricForm}
      />
      <ContentSection
        {...SECTION_CONFIGS.milestones}
        items={contentOutline.milestones}
        onAdd={handleAddMilestone}
        onEdit={handleEditMilestone}
        onDelete={onDeleteMilestone}
        renderItem={SECTION_CONFIGS.milestones.renderer}
        editor={resolveEditorProps("milestone")}
        FormComponent={MilestoneForm}
      />
    </>
  );
}
