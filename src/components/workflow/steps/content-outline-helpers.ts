import type { ContentOutline } from "@/types/workflow";

export {
  createNewFunctionalRequirement,
  type FunctionalRequirementInput,
} from "./functional-requirement-helpers";
export { createNewMilestone, type MilestoneInput } from "./milestone-helpers";
export {
  createNewSuccessMetric,
  type SuccessMetricInput,
} from "./success-metric-helpers";

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
