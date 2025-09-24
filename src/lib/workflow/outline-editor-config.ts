
import type { OutlineEntityMetadata } from "@/components/workflow/steps/outline-entity-descriptor";
import { outlineEntityMetadata } from "@/components/workflow/steps/outline-entity-metadata";
import type { ContentOutline } from "@/types/workflow";

import type {
  DraftForKind,
  EditorKind,
  ItemForKind,
} from "./outline-editor-types";

type ConfigEntry<Item, Draft> = {
  defaultDraft: () => Draft;
  toDraft: (item: Item) => Draft;
  buildItem: (draft: Draft, fallbackId?: string) => Item;
  addToOutline: (outline: ContentOutline, item: Item) => ContentOutline;
  updateInOutline: (
    outline: ContentOutline,
    id: string,
    item: Item
  ) => ContentOutline;
  findById: (outline: ContentOutline, id?: string) => Item | undefined;
};

const createConfigEntry = <K extends EditorKind>(
  metadata: OutlineEntityMetadata<ItemForKind<K>, DraftForKind<K>>
): ConfigEntry<ItemForKind<K>, DraftForKind<K>> => ({
  defaultDraft: () => metadata.defaults(),
  toDraft: (item) => metadata.toDraft(item),
  buildItem: (draft, fallbackId) => metadata.fromDraft(draft, fallbackId),
  addToOutline: metadata.addToOutline,
  updateInOutline: metadata.updateInOutline,
  findById: (outline, id) => {
    if (id === undefined || id === "") {
      return undefined;
    }

    return metadata
      .selectFromOutline(outline)
      .find((item) => item[metadata.idKey] === id);
  },
});

type ConfigCacheEntry = ConfigEntry<
  ItemForKind<EditorKind>,
  DraftForKind<EditorKind>
>;

const configCache: Partial<Record<EditorKind, ConfigCacheEntry>> = {};

const getConfigFor = <K extends EditorKind>(
  kind: K
): ConfigEntry<ItemForKind<K>, DraftForKind<K>> => {
  if (!configCache[kind]) {
    const metadata = outlineEntityMetadata[kind] as OutlineEntityMetadata<
      ItemForKind<K>,
      DraftForKind<K>
    >;
    const entry = createConfigEntry(metadata);
    configCache[kind] = entry as unknown as ConfigCacheEntry;
    return entry;
  }

  return configCache[kind] as unknown as ConfigEntry<
    ItemForKind<K>,
    DraftForKind<K>
  >;
};

export const getDefaultDraftFor = <K extends EditorKind>(kind: K) =>
  getConfigFor(kind).defaultDraft();

export const mapItemToDraftFor = <K extends EditorKind>(
  kind: K,
  item: ItemForKind<K>
) => getConfigFor(kind).toDraft(item);

export const buildItemFromDraft = <K extends EditorKind>(
  kind: K,
  draft: DraftForKind<K>,
  fallbackId?: string
) => getConfigFor(kind).buildItem(draft, fallbackId);

export const addItemToOutline = <K extends EditorKind>(
  kind: K,
  outline: ContentOutline,
  item: ItemForKind<K>
) => getConfigFor(kind).addToOutline(outline, item);

export const updateItemInOutline = <K extends EditorKind>(
  kind: K,
  outline: ContentOutline,
  id: string,
  item: ItemForKind<K>
) => getConfigFor(kind).updateInOutline(outline, id, item);

export const findItemForEditor = <K extends EditorKind>(
  kind: K,
  outline: ContentOutline,
  id?: string
) => getConfigFor(kind).findById(outline, id);
