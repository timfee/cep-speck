import type { ContentOutline } from "@/types/workflow";

import { addItemToOutline, updateItemInOutline } from "./outline-editor-config";

import type {
  EditorKind,
  EditorMode,
  ItemForKind,
} from "./outline-editor-types";

export type SubmitCallbackMap = {
  [K in EditorKind]: {
    onAdd?: (item: ItemForKind<K>) => void;
    onEdit?: (id: string, updates: Partial<ItemForKind<K>>) => void;
  };
};

interface CommitOptions<K extends EditorKind> {
  kind: K;
  mode: EditorMode;
  item: ItemForKind<K>;
  callbacks: SubmitCallbackMap[K];
  contentOutline: ContentOutline;
  onChange: (outline: ContentOutline) => void;
}

export const commitEditorItem = <K extends EditorKind>({
  kind,
  mode,
  item,
  callbacks,
  contentOutline,
  onChange,
}: CommitOptions<K>) => {
  if (mode === "create") {
    if (callbacks.onAdd) {
      callbacks.onAdd(item);
      return;
    }
    onChange(addItemToOutline(kind, contentOutline, item));
    return;
  }

  if (callbacks.onEdit) {
    callbacks.onEdit(item.id, item);
    return;
  }

  onChange(updateItemInOutline(kind, contentOutline, item.id, item));
};
