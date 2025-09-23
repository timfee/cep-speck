import { useCallback, useState } from "react";

import type { ContentOutline } from "@/types/workflow";

import {
  findItemForEditor,
  getDefaultDraftFor,
  mapItemToDraftFor,
} from "./outline-editor-config";

import type {
  DraftForKind,
  EditorKind,
  EditorMode,
  EditorState,
  StateForKind,
} from "./outline-editor-types";

export const toEditorState = <K extends EditorKind>(
  kind: K,
  mode: EditorMode,
  data: DraftForKind<K>
): StateForKind<K> => ({ kind, mode, data }) as StateForKind<K>;

export const getExistingId = <K extends EditorKind>(draft: DraftForKind<K>) =>
  (draft as { id?: string }).id;

export const useEditorStateController = (contentOutline: ContentOutline) => {
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  const closeEditor = useCallback(() => setEditorState(null), []);

  const openEditor = useCallback(
    (kind: EditorKind, mode: EditorMode, id?: string) => {
      if (mode === "create") {
        setEditorState(toEditorState(kind, mode, getDefaultDraftFor(kind)));
        return;
      }

      const existing = findItemForEditor(kind, contentOutline, id);
      if (!existing) {
        return;
      }

      setEditorState(
        toEditorState(kind, mode, mapItemToDraftFor(kind, existing))
      );
    },
    [contentOutline]
  );

  return { editorState, openEditor, closeEditor } as const;
};
