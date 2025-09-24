import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

import type { WorkflowStateSetter } from "./workflow-state";

type ContentType =
  | "functionalRequirements"
  | "successMetrics"
  | "milestones"
  | "customerJourneys"
  | "metricSchemas";
type ContentItem =
  | FunctionalRequirement
  | SuccessMetric
  | Milestone
  | CustomerJourney
  | SuccessMetricSchema;

/**
 * Generic utility to update items in content outline arrays
 */
function updateItemInArray<T extends ContentItem>(
  items: T[],
  id: string,
  updates: Partial<T>
): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...updates } : item));
}

/**
 * Generic utility to delete items from content outline arrays
 */
function deleteItemFromArray<T extends ContentItem>(
  items: T[],
  id: string
): T[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Generic utility to add items to content outline arrays
 */
function addItemToArray<T extends ContentItem>(items: T[], newItem: T): T[] {
  return [...items, newItem];
}

/**
 * Generic content outline updater
 */
function updateContentOutline<T extends ContentItem>(
  contentOutline: ContentOutline,
  contentType: ContentType,
  operation: "update" | "delete" | "add",
  id?: string,
  itemOrUpdates?: T | Partial<T>
): ContentOutline {
  const currentItems = contentOutline[contentType] as T[];

  let newItems: T[];
  if (
    operation === "update" &&
    id !== undefined &&
    id !== "" &&
    itemOrUpdates
  ) {
    newItems = updateItemInArray(currentItems, id, itemOrUpdates as Partial<T>);
  } else if (operation === "delete" && id !== undefined && id !== "") {
    newItems = deleteItemFromArray(currentItems, id);
  } else if (operation === "add" && itemOrUpdates) {
    newItems = addItemToArray(currentItems, itemOrUpdates as T);
  } else {
    newItems = currentItems;
  }

  return { ...contentOutline, [contentType]: newItems };
}

// Specific functions for each content type
export const updateFunctionalRequirementInOutline = (
  contentOutline: ContentOutline,
  id: string,
  updates: Partial<FunctionalRequirement>
): ContentOutline =>
  updateContentOutline(
    contentOutline,
    "functionalRequirements",
    "update",
    id,
    updates
  );

export const deleteFunctionalRequirementFromOutline = (
  contentOutline: ContentOutline,
  id: string
): ContentOutline =>
  updateContentOutline(contentOutline, "functionalRequirements", "delete", id);

export const addFunctionalRequirementToOutline = (
  contentOutline: ContentOutline,
  requirement: FunctionalRequirement
): ContentOutline =>
  updateContentOutline(
    contentOutline,
    "functionalRequirements",
    "add",
    undefined,
    requirement
  );

export const updateSuccessMetricInOutline = (
  contentOutline: ContentOutline,
  id: string,
  updates: Partial<SuccessMetric>
): ContentOutline =>
  updateContentOutline(contentOutline, "successMetrics", "update", id, updates);

export const deleteSuccessMetricFromOutline = (
  contentOutline: ContentOutline,
  id: string
): ContentOutline =>
  updateContentOutline(contentOutline, "successMetrics", "delete", id);

export const addSuccessMetricToOutline = (
  contentOutline: ContentOutline,
  metric: SuccessMetric
): ContentOutline =>
  updateContentOutline(
    contentOutline,
    "successMetrics",
    "add",
    undefined,
    metric
  );

export const updateMilestoneInOutline = (
  contentOutline: ContentOutline,
  id: string,
  updates: Partial<Milestone>
): ContentOutline =>
  updateContentOutline(contentOutline, "milestones", "update", id, updates);

export const deleteMilestoneFromOutline = (
  contentOutline: ContentOutline,
  id: string
): ContentOutline =>
  updateContentOutline(contentOutline, "milestones", "delete", id);

export const addMilestoneToOutline = (
  contentOutline: ContentOutline,
  milestone: Milestone
): ContentOutline =>
  updateContentOutline(
    contentOutline,
    "milestones",
    "add",
    undefined,
    milestone
  );

export const updateCustomerJourneyInOutline = (
  contentOutline: ContentOutline,
  id: string,
  updates: Partial<CustomerJourney>
): ContentOutline =>
  updateContentOutline(
    contentOutline,
    "customerJourneys",
    "update",
    id,
    updates
  );

export const deleteCustomerJourneyFromOutline = (
  contentOutline: ContentOutline,
  id: string
): ContentOutline =>
  updateContentOutline(contentOutline, "customerJourneys", "delete", id);

export const addCustomerJourneyToOutline = (
  contentOutline: ContentOutline,
  customerJourney: CustomerJourney
): ContentOutline =>
  updateContentOutline(
    contentOutline,
    "customerJourneys",
    "add",
    undefined,
    customerJourney
  );

export const updateMetricSchemaInOutline = (
  contentOutline: ContentOutline,
  id: string,
  updates: Partial<SuccessMetricSchema>
): ContentOutline =>
  updateContentOutline(contentOutline, "metricSchemas", "update", id, updates);

export const deleteMetricSchemaFromOutline = (
  contentOutline: ContentOutline,
  id: string
): ContentOutline =>
  updateContentOutline(contentOutline, "metricSchemas", "delete", id);

export const addMetricSchemaToOutline = (
  contentOutline: ContentOutline,
  metricSchema: SuccessMetricSchema
): ContentOutline =>
  updateContentOutline(
    contentOutline,
    "metricSchemas",
    "add",
    undefined,
    metricSchema
  );

/**
 * Generic state updater for content outline changes
 */
export const updateStateWithContentOutline = (
  setState: WorkflowStateSetter,
  newContentOutline: ContentOutline
): void => {
  setState((prev) => ({ ...prev, contentOutline: newContentOutline }));
};
