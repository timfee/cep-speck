import type { ContentOutline } from "@/types/workflow";

/**
 * Shared descriptor type that defines how an entity maps to editor drafts.
 */
export type IdentifierKey<Item, Draft> = Extract<
  keyof Item & keyof Draft,
  string
>;

export interface OutlineEntityDescriptor<Item, Draft> {
  /**
   * The primary identifier shared between the entity and its draft representation.
   */
  idKey: IdentifierKey<Item, Draft>;
  /**
   * Factory function that produces default draft values for the entity.
   */
  defaults: () => Draft;
  /**
   * Maps a persisted entity into a mutable draft representation.
   */
  toDraft: (item: Item) => Draft;
  /**
   * Builds a sanitised entity from an editor draft.
   */
  fromDraft: (draft: Draft, fallbackId?: string) => Item;
}

export interface OutlineEntityMetadata<Item, Draft>
  extends OutlineEntityDescriptor<Item, Draft> {
  addToOutline: (outline: ContentOutline, item: Item) => ContentOutline;
  updateInOutline: (
    outline: ContentOutline,
    id: string,
    item: Item
  ) => ContentOutline;
  selectFromOutline: (outline: ContentOutline) => Item[];
}
