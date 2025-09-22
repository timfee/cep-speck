import { useCallback } from "react";

import type {
  ContentOutline,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
} from "@/types/workflow";

import {
  createNewFunctionalRequirement,
  createNewMilestone,
  createNewSuccessMetric,
} from "../content-outline-helpers";

interface UseOutlineStepHandlersProps {
  contentOutline: ContentOutline;
  onChange: (outline: ContentOutline) => void;
  onAddFunctionalRequirement?: (requirement: FunctionalRequirement) => void;
  onAddSuccessMetric?: (metric: SuccessMetric) => void;
  onAddMilestone?: (milestone: Milestone) => void;
}

export function useOutlineStepHandlers({
  contentOutline,
  onChange,
  onAddFunctionalRequirement,
  onAddSuccessMetric,
  onAddMilestone,
}: UseOutlineStepHandlersProps) {
  const handleAddFunctionalRequirement = useCallback(() => {
    const newReq = createNewFunctionalRequirement();
    if (onAddFunctionalRequirement) {
      onAddFunctionalRequirement(newReq);
    } else {
      onChange({
        ...contentOutline,
        functionalRequirements: [
          ...contentOutline.functionalRequirements,
          newReq,
        ],
      });
    }
  }, [contentOutline, onChange, onAddFunctionalRequirement]);

  const handleAddSuccessMetric = useCallback(() => {
    const newMetric = createNewSuccessMetric();
    if (onAddSuccessMetric) {
      onAddSuccessMetric(newMetric);
    } else {
      onChange({
        ...contentOutline,
        successMetrics: [...contentOutline.successMetrics, newMetric],
      });
    }
  }, [contentOutline, onChange, onAddSuccessMetric]);

  const handleAddMilestone = useCallback(() => {
    const newMilestone = createNewMilestone();
    if (onAddMilestone) {
      onAddMilestone(newMilestone);
    } else {
      onChange({
        ...contentOutline,
        milestones: [...contentOutline.milestones, newMilestone],
      });
    }
  }, [contentOutline, onChange, onAddMilestone]);

  // Edit handlers - for now just console log to test the connection
  const handleEditFunctionalRequirement = useCallback((id: string) => {
    console.log("Edit functional requirement:", id);
    // TODO: Open edit dialog
  }, []);

  const handleEditSuccessMetric = useCallback((id: string) => {
    console.log("Edit success metric:", id);
    // TODO: Open edit dialog
  }, []);

  const handleEditMilestone = useCallback((id: string) => {
    console.log("Edit milestone:", id);
    // TODO: Open edit dialog
  }, []);

  return {
    handleAddFunctionalRequirement,
    handleEditFunctionalRequirement,
    handleAddSuccessMetric,
    handleEditSuccessMetric,
    handleAddMilestone,
    handleEditMilestone,
  };
}
