import { useCallback } from "react";

import type {
  FunctionalRequirement,
  Milestone,
  StructuredWorkflowState,
  SuccessMetric,
} from "@/types/workflow";

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
        contentOutline: {
          ...prev.contentOutline,
          functionalRequirements:
            prev.contentOutline.functionalRequirements.map((req) =>
              req.id === id ? { ...req, ...updates } : req
            ),
        },
      }));
    },
    [setState]
  );

  const deleteFunctionalRequirement = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          functionalRequirements:
            prev.contentOutline.functionalRequirements.filter(
              (req) => req.id !== id
            ),
        },
      }));
    },
    [setState]
  );

  const addFunctionalRequirement = useCallback(
    (requirement: FunctionalRequirement) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          functionalRequirements: [
            ...prev.contentOutline.functionalRequirements,
            requirement,
          ],
        },
      }));
    },
    [setState]
  );

  // Success metric operations
  const updateSuccessMetric = useCallback(
    (id: string, updates: Partial<SuccessMetric>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          successMetrics: prev.contentOutline.successMetrics.map((metric) =>
            metric.id === id ? { ...metric, ...updates } : metric
          ),
        },
      }));
    },
    [setState]
  );

  const deleteSuccessMetric = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          successMetrics: prev.contentOutline.successMetrics.filter(
            (metric) => metric.id !== id
          ),
        },
      }));
    },
    [setState]
  );

  const addSuccessMetric = useCallback(
    (metric: SuccessMetric) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          successMetrics: [...prev.contentOutline.successMetrics, metric],
        },
      }));
    },
    [setState]
  );

  // Milestone operations
  const updateMilestone = useCallback(
    (id: string, updates: Partial<Milestone>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          milestones: prev.contentOutline.milestones.map((milestone) =>
            milestone.id === id ? { ...milestone, ...updates } : milestone
          ),
        },
      }));
    },
    [setState]
  );

  const deleteMilestone = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          milestones: prev.contentOutline.milestones.filter(
            (milestone) => milestone.id !== id
          ),
        },
      }));
    },
    [setState]
  );

  const addMilestone = useCallback(
    (milestone: Milestone) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          milestones: [...prev.contentOutline.milestones, milestone],
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
  };
}
