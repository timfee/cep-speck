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
export {
  createNewCustomerJourney,
  type CustomerJourneyInput,
} from "./customer-journey-helpers";
export {
  createNewSuccessMetricSchema,
  type SuccessMetricSchemaInput,
} from "./metric-schema-helpers";

export function calculateTotalItems(contentOutline: ContentOutline): number {
  return (
    contentOutline.functionalRequirements.length +
    contentOutline.successMetrics.length +
    contentOutline.milestones.length +
    contentOutline.customerJourneys.length +
    contentOutline.metricSchemas.length
  );
}

export function getOutlineSummary(contentOutline: ContentOutline) {
  return {
    totalItems: calculateTotalItems(contentOutline),
    functionalRequirements: contentOutline.functionalRequirements.length,
    successMetrics: contentOutline.successMetrics.length,
    milestones: contentOutline.milestones.length,
    customerJourneys: contentOutline.customerJourneys.length,
    metricSchemas: contentOutline.metricSchemas.length,
  };
}
