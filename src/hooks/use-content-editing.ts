import { useCallback } from "react";

import type {
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  OutlineMetadata,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

import {
  addCustomerJourneyToOutline,
  addFunctionalRequirementToOutline,
  addMetricSchemaToOutline,
  addMilestoneToOutline,
  addSuccessMetricToOutline,
  deleteCustomerJourneyFromOutline,
  deleteFunctionalRequirementFromOutline,
  deleteMetricSchemaFromOutline,
  deleteMilestoneFromOutline,
  deleteSuccessMetricFromOutline,
  updateCustomerJourneyInOutline,
  updateFunctionalRequirementInOutline,
  updateMetricSchemaInOutline,
  updateMilestoneInOutline,
  updateSuccessMetricInOutline,
} from "./content-editing-utils";

import type { WorkflowStateSetter } from "./workflow-state";

/**
 * Hook for content editing operations
 * Extracted from use-structured-workflow to reduce complexity
 */
export function useContentEditing(setState: WorkflowStateSetter) {
  // Functional requirement operations
  const updateFunctionalRequirement = useCallback(
    (id: string, updates: Partial<FunctionalRequirement>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: updateFunctionalRequirementInOutline(
          prev.contentOutline,
          id,
          updates
        ),
      }));
    },
    [setState]
  );

  const deleteFunctionalRequirement = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contentOutline: deleteFunctionalRequirementFromOutline(
          prev.contentOutline,
          id
        ),
      }));
    },
    [setState]
  );

  const addFunctionalRequirement = useCallback(
    (requirement: FunctionalRequirement) => {
      setState((prev) => ({
        ...prev,
        contentOutline: addFunctionalRequirementToOutline(
          prev.contentOutline,
          requirement
        ),
      }));
    },
    [setState]
  );

  // Success metric operations
  const updateSuccessMetric = useCallback(
    (id: string, updates: Partial<SuccessMetric>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: updateSuccessMetricInOutline(
          prev.contentOutline,
          id,
          updates
        ),
      }));
    },
    [setState]
  );

  const deleteSuccessMetric = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contentOutline: deleteSuccessMetricFromOutline(prev.contentOutline, id),
      }));
    },
    [setState]
  );

  const addSuccessMetric = useCallback(
    (metric: SuccessMetric) => {
      setState((prev) => ({
        ...prev,
        contentOutline: addSuccessMetricToOutline(prev.contentOutline, metric),
      }));
    },
    [setState]
  );

  // Milestone operations
  const updateMilestone = useCallback(
    (id: string, updates: Partial<Milestone>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: updateMilestoneInOutline(
          prev.contentOutline,
          id,
          updates
        ),
      }));
    },
    [setState]
  );

  const deleteMilestone = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contentOutline: deleteMilestoneFromOutline(prev.contentOutline, id),
      }));
    },
    [setState]
  );

  const addMilestone = useCallback(
    (milestone: Milestone) => {
      setState((prev) => ({
        ...prev,
        contentOutline: addMilestoneToOutline(prev.contentOutline, milestone),
      }));
    },
    [setState]
  );

  const updateCustomerJourney = useCallback(
    (id: string, updates: Partial<CustomerJourney>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: updateCustomerJourneyInOutline(
          prev.contentOutline,
          id,
          updates
        ),
      }));
    },
    [setState]
  );

  const deleteCustomerJourney = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contentOutline: deleteCustomerJourneyFromOutline(
          prev.contentOutline,
          id
        ),
      }));
    },
    [setState]
  );

  const addCustomerJourney = useCallback(
    (customerJourney: CustomerJourney) => {
      setState((prev) => ({
        ...prev,
        contentOutline: addCustomerJourneyToOutline(
          prev.contentOutline,
          customerJourney
        ),
      }));
    },
    [setState]
  );

  const updateMetricSchema = useCallback(
    (id: string, updates: Partial<SuccessMetricSchema>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: updateMetricSchemaInOutline(
          prev.contentOutline,
          id,
          updates
        ),
      }));
    },
    [setState]
  );

  const deleteMetricSchema = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contentOutline: deleteMetricSchemaFromOutline(prev.contentOutline, id),
      }));
    },
    [setState]
  );

  const addMetricSchema = useCallback(
    (metricSchema: SuccessMetricSchema) => {
      setState((prev) => ({
        ...prev,
        contentOutline: addMetricSchemaToOutline(
          prev.contentOutline,
          metricSchema
        ),
      }));
    },
    [setState]
  );

  const updateOutlineMetadata = useCallback(
    (updates: Partial<OutlineMetadata>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          metadata: { ...prev.contentOutline.metadata, ...updates },
        },
      }));
    },
    [setState]
  );

  return {
    updateFunctionalRequirement,
    deleteFunctionalRequirement,
    addFunctionalRequirement,
    updateSuccessMetric,
    deleteSuccessMetric,
    addSuccessMetric,
    updateMilestone,
    deleteMilestone,
    addMilestone,
    updateOutlineMetadata,
    updateCustomerJourney,
    deleteCustomerJourney,
    addCustomerJourney,
    updateMetricSchema,
    deleteMetricSchema,
    addMetricSchema,
  };
}
