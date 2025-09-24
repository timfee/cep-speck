import { useCallback, useMemo } from "react";

import {
  type OutlineCollectionItem,
  type OutlineCollectionKey,
  type OutlineMutation,
  mutateOutline,
} from "@/lib/utils/content-editing-utils";

import type { WorkflowStateSetter } from "@/lib/utils/workflow-state";

import type {
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  OutlineMetadata,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";



type OutlineActionConfig<K extends OutlineCollectionKey, Item> = {
  kind: K;
  __itemType?: Item;
};

export const outlineActionRegistry = {
  FunctionalRequirement: { kind: "functionalRequirements" },
  SuccessMetric: { kind: "successMetrics" },
  Milestone: { kind: "milestones" },
  CustomerJourney: { kind: "customerJourneys" },
  MetricSchema: { kind: "metricSchemas" },
} as const satisfies {
  FunctionalRequirement: OutlineActionConfig<
    "functionalRequirements",
    FunctionalRequirement
  >;
  SuccessMetric: OutlineActionConfig<"successMetrics", SuccessMetric>;
  Milestone: OutlineActionConfig<"milestones", Milestone>;
  CustomerJourney: OutlineActionConfig<"customerJourneys", CustomerJourney>;
  MetricSchema: OutlineActionConfig<"metricSchemas", SuccessMetricSchema>;
};

type OutlineRegistry = typeof outlineActionRegistry;
type OutlineRegistryKey = keyof OutlineRegistry;
export type { OutlineRegistry as OutlineActionRegistry };

type OutlineHandlers = {
  [K in OutlineRegistryKey as `add${K & string}`]: (
    item: OutlineCollectionItem<OutlineRegistry[K]["kind"]>
  ) => void;
} & {
  [K in OutlineRegistryKey as `update${K & string}`]: (
    id: string,
    updates: Partial<OutlineCollectionItem<OutlineRegistry[K]["kind"]>>
  ) => void;
} & {
  [K in OutlineRegistryKey as `delete${K & string}`]: (id: string) => void;
};

export type ContentEditingActions = OutlineHandlers & {
  updateOutlineMetadata: (updates: Partial<OutlineMetadata>) => void;
};

type MutationBuilder<K extends OutlineCollectionKey, Args extends unknown[]> = (
  ...args: Args
) => OutlineMutation<K>;

type OutlineItemFor<K extends OutlineRegistryKey> = OutlineCollectionItem<
  OutlineRegistry[K]["kind"]
>;

type HandlerGroupKey<K extends OutlineRegistryKey> =
  | `add${K & string}`
  | `update${K & string}`
  | `delete${K & string}`;

type HandlerGroup<K extends OutlineRegistryKey> = Pick<
  OutlineHandlers,
  HandlerGroupKey<K>
>;

const outlineActionKeys = Object.keys(
  outlineActionRegistry
) as OutlineRegistryKey[];

function createHandlerGroup<K extends OutlineRegistryKey>(
  createHandler: <T extends OutlineCollectionKey, Args extends unknown[]>(
    kind: T,
    builder: MutationBuilder<T, Args>
  ) => (...args: Args) => void,
  name: K
): HandlerGroup<K> {
  const { kind } = outlineActionRegistry[name];

  return {
    [`add${name}`]: createHandler(kind, (item: OutlineItemFor<K>) => ({
      type: "add",
      item,
    })),
    [`update${name}`]: createHandler(
      kind,
      (id: string, updates: Partial<OutlineItemFor<K>>) => ({
        type: "update",
        id,
        updates,
      })
    ),
    [`delete${name}`]: createHandler(kind, (id: string) => ({
      type: "delete",
      id,
    })),
  } as HandlerGroup<K>;
}

export function useContentEditing(
  setState: WorkflowStateSetter
): ContentEditingActions {
  const commitMutation = useCallback(
    <K extends OutlineCollectionKey>(kind: K, mutation: OutlineMutation<K>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: mutateOutline(prev.contentOutline, kind, mutation),
      }));
    },
    [setState]
  );

  const createHandler = useCallback(
    <K extends OutlineCollectionKey, Args extends unknown[]>(
      kind: K,
      builder: MutationBuilder<K, Args>
    ) =>
      (...args: Args) => {
        commitMutation(kind, builder(...args));
      },
    [commitMutation]
  );

  const collectionHandlers = useMemo<OutlineHandlers>(() => {
    const handlers = {} as OutlineHandlers;

    for (const name of outlineActionKeys) {
      Object.assign(handlers, createHandlerGroup(createHandler, name));
    }

    return handlers;
  }, [createHandler]);

  const updateOutlineMetadata = useCallback(
    (updates: Partial<OutlineMetadata>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: {
          ...prev.contentOutline,
          metadata: { ...prev.contentOutline.metadata, ...updates },
        },
      }));
    },
    [setState]
  );

  return useMemo(
    () => ({
      ...collectionHandlers,
      updateOutlineMetadata,
    }),
    [collectionHandlers, updateOutlineMetadata]
  );
}
