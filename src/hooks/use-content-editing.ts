import { useCallback } from "react";

import type {
  FunctionalRequirement,
  Milestone,
  StructuredWorkflowState,
  SuccessMetric,
} from "@/types/workflow";

import {
  addFunctionalRequirementToOutline,
  addMilestoneToOutline,
  addSuccessMetricToOutline,
  deleteFunctionalRequirementFromOutline,
  deleteMilestoneFromOutline,
  deleteSuccessMetricFromOutline,
  updateFunctionalRequirementInOutline,
  updateMilestoneInOutline,
  updateSuccessMetricInOutline,
} from "./content-editing-utils";

/**
 * Hook for content editing operations
 * Extracted from use-structured-workflow to reduce complexity
 */
export function useContentEditing(
  setState: (
    updater: (prev: StructuredWorkflowState) => StructuredWorkflowState
  ) => void
) {
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
  };
}
