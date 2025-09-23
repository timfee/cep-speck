import { useCallback, useMemo } from "react";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

import type { SubmitCallbackMap } from "./outline-editor-callbacks";
import { useOutlineEditorManager } from "./outline-editor-manager";

interface UseOutlineStepHandlersProps {
  contentOutline: ContentOutline;
  onChange: (outline: ContentOutline) => void;
  onAddFunctionalRequirement?: (requirement: FunctionalRequirement) => void;
  onEditFunctionalRequirement?: (
    id: string,
    updates: Partial<FunctionalRequirement>
  ) => void;
  onAddSuccessMetric?: (metric: SuccessMetric) => void;
  onEditSuccessMetric?: (id: string, updates: Partial<SuccessMetric>) => void;
  onAddMilestone?: (milestone: Milestone) => void;
  onEditMilestone?: (id: string, updates: Partial<Milestone>) => void;
  onAddCustomerJourney?: (journey: CustomerJourney) => void;
  onEditCustomerJourney?: (
    id: string,
    updates: Partial<CustomerJourney>
  ) => void;
  onAddMetricSchema?: (schema: SuccessMetricSchema) => void;
  onEditMetricSchema?: (
    id: string,
    updates: Partial<SuccessMetricSchema>
  ) => void;
}

type SubmitCallbackDependencies = Pick<
  UseOutlineStepHandlersProps,
  | "onAddFunctionalRequirement"
  | "onEditFunctionalRequirement"
  | "onAddSuccessMetric"
  | "onEditSuccessMetric"
  | "onAddMilestone"
  | "onEditMilestone"
  | "onAddCustomerJourney"
  | "onEditCustomerJourney"
  | "onAddMetricSchema"
  | "onEditMetricSchema"
>;

const createSubmitCallbackMap = ({
  onAddFunctionalRequirement,
  onEditFunctionalRequirement,
  onAddSuccessMetric,
  onEditSuccessMetric,
  onAddMilestone,
  onEditMilestone,
  onAddCustomerJourney,
  onEditCustomerJourney,
  onAddMetricSchema,
  onEditMetricSchema,
}: SubmitCallbackDependencies): SubmitCallbackMap => ({
  functionalRequirement: {
    onAdd: onAddFunctionalRequirement,
    onEdit: onEditFunctionalRequirement,
  },
  successMetric: {
    onAdd: onAddSuccessMetric,
    onEdit: onEditSuccessMetric,
  },
  milestone: {
    onAdd: onAddMilestone,
    onEdit: onEditMilestone,
  },
  customerJourney: {
    onAdd: onAddCustomerJourney,
    onEdit: onEditCustomerJourney,
  },
  metricSchema: {
    onAdd: onAddMetricSchema,
    onEdit: onEditMetricSchema,
  },
});

export function useOutlineStepHandlers(props: UseOutlineStepHandlersProps) {
  const {
    contentOutline,
    onChange,
    onAddFunctionalRequirement,
    onEditFunctionalRequirement,
    onAddSuccessMetric,
    onEditSuccessMetric,
    onAddMilestone,
    onEditMilestone,
    onAddCustomerJourney,
    onEditCustomerJourney,
    onAddMetricSchema,
    onEditMetricSchema,
  } = props;

  const submitCallbacks = useMemo(
    () =>
      createSubmitCallbackMap({
        onAddFunctionalRequirement,
        onEditFunctionalRequirement,
        onAddSuccessMetric,
        onEditSuccessMetric,
        onAddMilestone,
        onEditMilestone,
        onAddCustomerJourney,
        onEditCustomerJourney,
        onAddMetricSchema,
        onEditMetricSchema,
      }),
    [
      onAddFunctionalRequirement,
      onAddMilestone,
      onAddSuccessMetric,
      onEditFunctionalRequirement,
      onEditMilestone,
      onEditSuccessMetric,
      onAddCustomerJourney,
      onEditCustomerJourney,
      onAddMetricSchema,
      onEditMetricSchema,
    ]
  );

  const { editorState, openEditor, closeEditor, submitEditor } =
    useOutlineEditorManager({
      contentOutline,
      onChange,
      submitCallbacks,
    });

  return {
    handleAddFunctionalRequirement: useCallback(
      () => openEditor("functionalRequirement", "create"),
      [openEditor]
    ),
    handleEditFunctionalRequirement: useCallback(
      (id: string) => openEditor("functionalRequirement", "edit", id),
      [openEditor]
    ),
    handleAddSuccessMetric: useCallback(
      () => openEditor("successMetric", "create"),
      [openEditor]
    ),
    handleEditSuccessMetric: useCallback(
      (id: string) => openEditor("successMetric", "edit", id),
      [openEditor]
    ),
    handleAddMilestone: useCallback(
      () => openEditor("milestone", "create"),
      [openEditor]
    ),
    handleEditMilestone: useCallback(
      (id: string) => openEditor("milestone", "edit", id),
      [openEditor]
    ),
    handleAddCustomerJourney: useCallback(
      () => openEditor("customerJourney", "create"),
      [openEditor]
    ),
    handleEditCustomerJourney: useCallback(
      (id: string) => openEditor("customerJourney", "edit", id),
      [openEditor]
    ),
    handleAddMetricSchema: useCallback(
      () => openEditor("metricSchema", "create"),
      [openEditor]
    ),
    handleEditMetricSchema: useCallback(
      (id: string) => openEditor("metricSchema", "edit", id),
      [openEditor]
    ),
    editorState,
    cancelEditor: closeEditor,
    submitEditor,
  } as const;
}
