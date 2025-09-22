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

type ContentHandler<T> = (newItem: T) => void;
type EditHandler = (id: string) => void;

export function useOutlineStepHandlers({
  contentOutline,
  onChange,
  onAddFunctionalRequirement,
  onAddSuccessMetric,
  onAddMilestone,
}: UseOutlineStepHandlersProps) {
  // Generic add handler factory
  const createAddHandler = useCallback(
    <T>(
      creator: () => T,
      arrayKey: keyof ContentOutline,
      customHandler?: ContentHandler<T>
    ) => {
      return () => {
        const newItem = creator();
        if (customHandler) {
          customHandler(newItem);
        } else {
          onChange({
            ...contentOutline,
            [arrayKey]: [...(contentOutline[arrayKey] as T[]), newItem],
          });
        }
      };
    },
    [contentOutline, onChange]
  );

  // Create edit handler factory
  const createEditHandler = useCallback(
    (itemType: string): EditHandler =>
      (id: string) => {
        console.log(`Edit ${itemType}:`, id);
        // TODO: Open edit dialog
      },
    []
  );

  return {
    handleAddFunctionalRequirement: createAddHandler(
      createNewFunctionalRequirement,
      "functionalRequirements",
      onAddFunctionalRequirement
    ),
    handleEditFunctionalRequirement: createEditHandler(
      "functional requirement"
    ),
    handleAddSuccessMetric: createAddHandler(
      createNewSuccessMetric,
      "successMetrics",
      onAddSuccessMetric
    ),
    handleEditSuccessMetric: createEditHandler("success metric"),
    handleAddMilestone: createAddHandler(
      createNewMilestone,
      "milestones",
      onAddMilestone
    ),
    handleEditMilestone: createEditHandler("milestone"),
  };
}
