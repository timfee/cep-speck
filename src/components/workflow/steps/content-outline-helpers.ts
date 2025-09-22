import type {
  ContentOutline,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
} from "@/types/workflow";

/**
 * Create helper functions for content outline step
 * Extracted to reduce component complexity
 */

export function createNewFunctionalRequirement(): FunctionalRequirement {
  return {
    id: `fr-${Date.now()}`,
    title: "New Functional Requirement",
    description: "Enter description here",
    priority: "P1",
  };
}

export function createNewSuccessMetric(): SuccessMetric {
  return {
    id: `sm-${Date.now()}`,
    name: "New Success Metric",
    description: "Enter description here",
    type: "engagement",
  };
}

export function createNewMilestone(): Milestone {
  return {
    id: `ms-${Date.now()}`,
    title: "New Milestone",
    description: "Enter description here",
    phase: "development",
  };
}

export function calculateTotalItems(contentOutline: ContentOutline): number {
  return (
    contentOutline.functionalRequirements.length +
    contentOutline.successMetrics.length +
    contentOutline.milestones.length
  );
}

export function getOutlineSummary(contentOutline: ContentOutline) {
  return {
    totalItems: calculateTotalItems(contentOutline),
    functionalRequirements: contentOutline.functionalRequirements.length,
    successMetrics: contentOutline.successMetrics.length,
    milestones: contentOutline.milestones.length,
  };
}
