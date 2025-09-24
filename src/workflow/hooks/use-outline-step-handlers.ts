import { useMemo } from "react";

import type { SubmitCallbackMap } from "@/lib/workflow/outline-editor-callbacks";
import { useOutlineEditorManager } from "@/lib/workflow/outline-editor-manager";

import {
  EDITOR_KINDS,
  type EditorKind,
} from "@/lib/workflow/outline-editor-types";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

export type OutlineEditorHandlerMap = {
  [K in EditorKind]: {
    handleAdd: () => void;
    handleEdit: (id: string) => void;
  };
};

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

  const handlersByKind = useMemo(() => {
    const map = {} as OutlineEditorHandlerMap;
    for (const kind of EDITOR_KINDS) {
      map[kind] = {
        handleAdd: () => openEditor(kind, "create"),
        handleEdit: (id: string) => openEditor(kind, "edit", id),
      };
    }
    return map;
  }, [openEditor]);

  return {
    handlersByKind,
    editorState,
    cancelEditor: closeEditor,
    submitEditor,
  } as const;
}
