import { useCallback, useMemo } from "react";

import type {
  ContentOutline,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
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
}

type SubmitCallbackDependencies = Pick<
  UseOutlineStepHandlersProps,
  | "onAddFunctionalRequirement"
  | "onEditFunctionalRequirement"
  | "onAddSuccessMetric"
  | "onEditSuccessMetric"
  | "onAddMilestone"
  | "onEditMilestone"
>;

const createSubmitCallbackMap = ({
  onAddFunctionalRequirement,
  onEditFunctionalRequirement,
  onAddSuccessMetric,
  onEditSuccessMetric,
  onAddMilestone,
  onEditMilestone,
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
      }),
    [
      onAddFunctionalRequirement,
      onAddMilestone,
      onAddSuccessMetric,
      onEditFunctionalRequirement,
      onEditMilestone,
      onEditSuccessMetric,
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
    editorState,
    cancelEditor: closeEditor,
    submitEditor,
  } as const;
}
