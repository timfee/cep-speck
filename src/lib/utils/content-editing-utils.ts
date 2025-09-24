import type { ContentOutline } from "@/types/workflow";

export type OutlineCollectionKey =
  | "functionalRequirements"
  | "successMetrics"
  | "milestones"
  | "customerJourneys"
  | "metricSchemas";

type OutlineCollections = Pick<ContentOutline, OutlineCollectionKey>;

export type OutlineCollectionItem<K extends OutlineCollectionKey> =
  OutlineCollections[K][number];

export type OutlineMutation<K extends OutlineCollectionKey> =
  | { type: "add"; item: OutlineCollectionItem<K> }
  | { type: "update"; id: string; updates: Partial<OutlineCollectionItem<K>> }
  | { type: "delete"; id: string };

function applyAddMutation<K extends OutlineCollectionKey>(
  items: OutlineCollectionItem<K>[],
  mutation: Extract<OutlineMutation<K>, { type: "add" }>
): OutlineCollectionItem<K>[] {
  return [...items, mutation.item];
}

function applyUpdateMutation<K extends OutlineCollectionKey>(
  items: OutlineCollectionItem<K>[],
  mutation: Extract<OutlineMutation<K>, { type: "update" }>
): OutlineCollectionItem<K>[] {
  return items.map((item) =>
    item.id === mutation.id ? { ...item, ...mutation.updates } : item
  );
}

function applyDeleteMutation<K extends OutlineCollectionKey>(
  items: OutlineCollectionItem<K>[],
  mutation: Extract<OutlineMutation<K>, { type: "delete" }>
): OutlineCollectionItem<K>[] {
  return items.filter((item) => item.id !== mutation.id);
}

export function mutateOutline<K extends OutlineCollectionKey>(
  contentOutline: ContentOutline,
  kind: K,
  mutation: OutlineMutation<K>
): ContentOutline {
  const items = [...(contentOutline[kind] as OutlineCollectionItem<K>[])];

  let updatedItems: OutlineCollectionItem<K>[];
  switch (mutation.type) {
    case "add":
      updatedItems = applyAddMutation(items, mutation);
      break;
    case "update":
      updatedItems = applyUpdateMutation(items, mutation);
      break;
    case "delete":
      updatedItems = applyDeleteMutation(items, mutation);
      break;
    default:
      updatedItems = items;
      break;
  }

  return {
    ...contentOutline,
    [kind]: updatedItems,
  } as ContentOutline;
}
