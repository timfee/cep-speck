import React from "react";

import type { ContentOutline } from "@/types/workflow";

import { ContentSection } from "./content-section";
import { SECTION_CONFIGS } from "./content-sections-config";

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
  } = props;

  return (
    <>
      <ContentSection
        {...SECTION_CONFIGS.requirements}
        items={contentOutline.functionalRequirements}
        onAdd={handleAddFunctionalRequirement}
        onEdit={handleEditFunctionalRequirement}
        onDelete={onDeleteFunctionalRequirement}
        renderItem={SECTION_CONFIGS.requirements.renderer}
      />
      <ContentSection
        {...SECTION_CONFIGS.metrics}
        items={contentOutline.successMetrics}
        onAdd={handleAddSuccessMetric}
        onEdit={handleEditSuccessMetric}
        onDelete={onDeleteSuccessMetric}
        renderItem={SECTION_CONFIGS.metrics.renderer}
      />
      <ContentSection
        {...SECTION_CONFIGS.milestones}
        items={contentOutline.milestones}
        onAdd={handleAddMilestone}
        onEdit={handleEditMilestone}
        onDelete={onDeleteMilestone}
        renderItem={SECTION_CONFIGS.milestones.renderer}
      />
    </>
  );
}
