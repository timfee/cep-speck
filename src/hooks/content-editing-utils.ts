import type {
  ContentOutline,
  FunctionalRequirement,
  Milestone,
  StructuredWorkflowState,
  SuccessMetric,
} from "@/types/workflow";

/**
 * Utility function to update functional requirements in content outline
 */
export function updateFunctionalRequirementInOutline(
  contentOutline: ContentOutline,
  id: string,
  updates: Partial<FunctionalRequirement>
): ContentOutline {
  return {
    ...contentOutline,
    functionalRequirements: contentOutline.functionalRequirements.map((req) =>
      req.id === id ? { ...req, ...updates } : req
    ),
  };
}

/**
 * Utility function to delete functional requirement from content outline
 */
export function deleteFunctionalRequirementFromOutline(
  contentOutline: ContentOutline,
  id: string
): ContentOutline {
  return {
    ...contentOutline,
    functionalRequirements: contentOutline.functionalRequirements.filter(
      (req) => req.id !== id
    ),
  };
}

/**
 * Utility function to add functional requirement to content outline
 */
export function addFunctionalRequirementToOutline(
  contentOutline: ContentOutline,
  requirement: FunctionalRequirement
): ContentOutline {
  return {
    ...contentOutline,
    functionalRequirements: [
      ...contentOutline.functionalRequirements,
      requirement,
    ],
  };
}

/**
 * Utility function to update success metrics in content outline
 */
export function updateSuccessMetricInOutline(
  contentOutline: ContentOutline,
  id: string,
  updates: Partial<SuccessMetric>
): ContentOutline {
  return {
    ...contentOutline,
    successMetrics: contentOutline.successMetrics.map((metric) =>
      metric.id === id ? { ...metric, ...updates } : metric
    ),
  };
}

/**
 * Utility function to delete success metric from content outline
 */
export function deleteSuccessMetricFromOutline(
  contentOutline: ContentOutline,
  id: string
): ContentOutline {
  return {
    ...contentOutline,
    successMetrics: contentOutline.successMetrics.filter(
      (metric) => metric.id !== id
    ),
  };
}

/**
 * Utility function to add success metric to content outline
 */
export function addSuccessMetricToOutline(
  contentOutline: ContentOutline,
  metric: SuccessMetric
): ContentOutline {
  return {
    ...contentOutline,
    successMetrics: [...contentOutline.successMetrics, metric],
  };
}

/**
 * Utility function to update milestones in content outline
 */
export function updateMilestoneInOutline(
  contentOutline: ContentOutline,
  id: string,
  updates: Partial<Milestone>
): ContentOutline {
  return {
    ...contentOutline,
    milestones: contentOutline.milestones.map((milestone) =>
      milestone.id === id ? { ...milestone, ...updates } : milestone
    ),
  };
}

/**
 * Utility function to delete milestone from content outline
 */
export function deleteMilestoneFromOutline(
  contentOutline: ContentOutline,
  id: string
): ContentOutline {
  return {
    ...contentOutline,
    milestones: contentOutline.milestones.filter(
      (milestone) => milestone.id !== id
    ),
  };
}

/**
 * Utility function to add milestone to content outline
 */
export function addMilestoneToOutline(
  contentOutline: ContentOutline,
  milestone: Milestone
): ContentOutline {
  return {
    ...contentOutline,
    milestones: [...contentOutline.milestones, milestone],
  };
}

/**
 * Generic state updater for content outline changes
 */
export function updateStateWithContentOutline(
  setState: (
    updater: (prev: StructuredWorkflowState) => StructuredWorkflowState
  ) => void,
  newContentOutline: ContentOutline
): void {
  setState((prev) => ({
    ...prev,
    contentOutline: newContentOutline,
  }));
}
