import { useCallback } from "react";

import type { ContentOutline } from "@/types/workflow";

import {
  commitEditorItem,
  type SubmitCallbackMap,
} from "./outline-editor-callbacks";

import { buildItemFromDraft } from "./outline-editor-config";

import {
  getExistingId,
  useEditorStateController,
} from "./outline-editor-state";

import type { DraftForKind, EditorValues } from "./outline-editor-types";

interface UseOutlineEditorManagerProps {
  contentOutline: ContentOutline;
  onChange: (outline: ContentOutline) => void;
  submitCallbacks: SubmitCallbackMap;
}

export function useOutlineEditorManager({
  contentOutline,
  onChange,
  submitCallbacks,
}: UseOutlineEditorManagerProps) {
  const { editorState, openEditor, closeEditor } =
    useEditorStateController(contentOutline);

  const submitEditor = useCallback(
    (values: EditorValues) => {
      if (!editorState) {
        return;
      }

      const { kind, mode, data } = editorState;
      const draft = values as DraftForKind<typeof kind>;
      const fallbackId = getExistingId(data) ?? getExistingId(draft);
      const item = buildItemFromDraft(kind, draft, fallbackId);

      commitEditorItem({
        kind,
        mode,
        item,
        callbacks: submitCallbacks[kind],
        contentOutline,
        onChange,
      });

      closeEditor();
    },
    [editorState, submitCallbacks, onChange, contentOutline, closeEditor]
  );

  return {
    editorState,
    openEditor,
    closeEditor,
    submitEditor,
  } as const;
}
