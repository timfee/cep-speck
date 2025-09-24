import { useMemo } from "react";

import type { OutlineMetadata } from "@/types/workflow";

import {
  mutateOutline,
  type OutlineCollectionKind,
  type OutlineItem,
} from "./content-editing-utils";

import type { WorkflowStateSetter } from "./workflow-state";

type OutlineActionNames<
  Add extends string,
  Update extends string,
  Delete extends string,
> = {
  add: Add;
  update: Update;
  delete: Delete;
};

export const outlineActions = {
  functionalRequirements: {
    add: "addFunctionalRequirement",
    update: "updateFunctionalRequirement",
    delete: "deleteFunctionalRequirement",
  },
  successMetrics: {
    add: "addSuccessMetric",
    update: "updateSuccessMetric",
    delete: "deleteSuccessMetric",
  },
  milestones: {
    add: "addMilestone",
    update: "updateMilestone",
    delete: "deleteMilestone",
  },
  customerJourneys: {
    add: "addCustomerJourney",
    update: "updateCustomerJourney",
    delete: "deleteCustomerJourney",
  },
  metricSchemas: {
    add: "addMetricSchema",
    update: "updateMetricSchema",
    delete: "deleteMetricSchema",
  },
} as const satisfies Record<
  OutlineCollectionKind,
  OutlineActionNames<string, string, string>
>;

type OutlineActionDefinitions = typeof outlineActions;

type CollectionHandlers = {
  [K in OutlineCollectionKind as OutlineActionDefinitions[K]["add"]]: (
    item: OutlineItem<K>
  ) => void;
} & {
  [K in OutlineCollectionKind as OutlineActionDefinitions[K]["update"]]: (
    id: string,
    updates: Partial<OutlineItem<K>>
  ) => void;
} & {
  [K in OutlineCollectionKind as OutlineActionDefinitions[K]["delete"]]: (
    id: string
  ) => void;
};

type ContentEditingHandlers = CollectionHandlers & {
  updateOutlineMetadata: (updates: Partial<OutlineMetadata>) => void;
};

export function useContentEditing(
  setState: WorkflowStateSetter
): ContentEditingHandlers {
  return useMemo(() => {
    const handlerMap: Partial<ContentEditingHandlers> = {};

    const registerHandlersFor = <K extends OutlineCollectionKind>(kind: K) => {
      const { add, update, delete: remove } = outlineActions[kind];

      handlerMap[add] = ((item: OutlineItem<K>) => {
        setState((prev) => ({
          ...prev,
          contentOutline: mutateOutline(prev.contentOutline, kind, {
            type: "add",
            item,
          }),
        }));
      }) as ContentEditingHandlers[typeof add];

      handlerMap[update] = ((id: string, updates: Partial<OutlineItem<K>>) => {
        setState((prev) => ({
          ...prev,
          contentOutline: mutateOutline(prev.contentOutline, kind, {
            type: "update",
            id,
            updates,
          }),
        }));
      }) as ContentEditingHandlers[typeof update];

      handlerMap[remove] = ((id: string) => {
        setState((prev) => ({
          ...prev,
          contentOutline: mutateOutline(prev.contentOutline, kind, {
            type: "delete",
            id,
          }),
        }));
      }) as ContentEditingHandlers[typeof remove];
    };

    for (const kind of Object.keys(outlineActions) as OutlineCollectionKind[]) {
      registerHandlersFor(kind);
    }

    handlerMap.updateOutlineMetadata = (updates: Partial<OutlineMetadata>) => {
      setState((prev) => ({
        ...prev,
        contentOutline: mutateOutline(prev.contentOutline, "metadata", {
          type: "update",
          updates,
        }),
      }));
    };

    return handlerMap as ContentEditingHandlers;
  }, [setState]);
}
