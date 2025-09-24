import type { ContentOutline } from "@/types/workflow";

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
