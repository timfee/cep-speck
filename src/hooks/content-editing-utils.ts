import type { ContentOutline, OutlineMetadata } from "@/types/workflow";

export type OutlineCollections = Pick<
  ContentOutline,
  | "functionalRequirements"
  | "successMetrics"
  | "milestones"
  | "customerJourneys"
  | "metricSchemas"
>;

export type OutlineCollectionKind = keyof OutlineCollections;

export type OutlineItem<K extends OutlineCollectionKind> =
  OutlineCollections[K] extends Array<infer Item> ? Item : never;

type CollectionMutation<K extends OutlineCollectionKind> =
  | {
      type: "add";
      item: OutlineItem<K>;
    }
  | {
      type: "update";
      id: string;
      updates: Partial<OutlineItem<K>>;
    }
  | {
      type: "delete";
      id: string;
    };

export type OutlineMutationKind = OutlineCollectionKind | "metadata";

export type OutlineMutationOperation<K extends OutlineMutationKind> =
  K extends "metadata"
    ? {
        type: "update";
        updates: Partial<OutlineMetadata>;
      }
    : CollectionMutation<Extract<K, OutlineCollectionKind>>;

function addItem<K extends OutlineCollectionKind>(
  items: OutlineCollections[K],
  item: OutlineItem<K>
): OutlineCollections[K] {
  return [...items, item];
}

function updateItem<K extends OutlineCollectionKind>(
  items: OutlineCollections[K],
  id: string,
  updates: Partial<OutlineItem<K>>
): OutlineCollections[K] {
  return items.map((item) =>
    item.id === id ? ({ ...item, ...updates } as OutlineItem<K>) : item
  ) as OutlineCollections[K];
}

function deleteItem<K extends OutlineCollectionKind>(
  items: OutlineCollections[K],
  id: string
): OutlineCollections[K] {
  return items.filter((item) => item.id !== id) as OutlineCollections[K];
}

function mutateCollection<K extends OutlineCollectionKind>(
  contentOutline: ContentOutline,
  kind: K,
  operation: CollectionMutation<K>
): ContentOutline {
  const currentItems = contentOutline[kind];

  if (operation.type === "add") {
    return {
      ...contentOutline,
      [kind]: addItem(currentItems, operation.item),
    } as ContentOutline;
  }

  if (operation.type === "update") {
    return {
      ...contentOutline,
      [kind]: updateItem(currentItems, operation.id, operation.updates),
    } as ContentOutline;
  }

  return {
    ...contentOutline,
    [kind]: deleteItem(currentItems, operation.id),
  } as ContentOutline;
}

export function mutateOutline<K extends OutlineMutationKind>(
  contentOutline: ContentOutline,
  kind: K,
  operation: OutlineMutationOperation<K>
): ContentOutline {
  if (kind === "metadata") {
    return {
      ...contentOutline,
      metadata: {
        ...contentOutline.metadata,
        ...(operation as OutlineMutationOperation<"metadata">).updates,
      },
    };
  }

  return mutateCollection(
    contentOutline,
    kind,
    operation as CollectionMutation<OutlineCollectionKind>
  );
}
