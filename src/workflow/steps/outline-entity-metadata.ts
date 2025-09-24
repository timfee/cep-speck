import {
  mutateOutline,
  type OutlineCollectionKey,
} from "@/lib/utils/content-editing-utils";

import type {
  DraftForKind,
  EditorKind,
  ItemForKind,
} from "@/lib/workflow/outline-editor-types";

import type { ContentOutline } from "@/types/workflow";

import { customerJourneyDescriptor } from "./customer-journey-helpers";
import { functionalRequirementDescriptor } from "./functional-requirement-helpers";
import { successMetricSchemaDescriptor } from "./metric-schema-helpers";
import { milestoneDescriptor } from "./milestone-helpers";
import type { OutlineEntityMetadata } from "./outline-entity-descriptor";
import { successMetricDescriptor } from "./success-metric-helpers";

// Map editor kinds to outline collection keys
const kindToCollectionKey: Record<EditorKind, OutlineCollectionKey> = {
  functionalRequirement: "functionalRequirements",
  successMetric: "successMetrics",
  milestone: "milestones",
  customerJourney: "customerJourneys",
  metricSchema: "metricSchemas",
};

// Generic helper functions that use mutateOutline
const createAddFunction =
  <K extends EditorKind>(kind: K) =>
  (outline: ContentOutline, item: ItemForKind<K>): ContentOutline =>
    mutateOutline(outline, kindToCollectionKey[kind], { type: "add", item });

const createUpdateFunction =
  <K extends EditorKind>(kind: K) =>
  (
    outline: ContentOutline,
    id: string,
    updates: Partial<ItemForKind<K>>
  ): ContentOutline =>
    mutateOutline(outline, kindToCollectionKey[kind], {
      type: "update",
      id,
      updates,
    });

type OutlineEntityMetadataMap = {
  [K in EditorKind]: OutlineEntityMetadata<ItemForKind<K>, DraftForKind<K>>;
};

export const outlineEntityMetadata: OutlineEntityMetadataMap = {
  functionalRequirement: {
    ...functionalRequirementDescriptor,
    addToOutline: createAddFunction("functionalRequirement"),
    updateInOutline: createUpdateFunction("functionalRequirement"),
    selectFromOutline: (outline: ContentOutline) =>
      outline.functionalRequirements,
  },
  successMetric: {
    ...successMetricDescriptor,
    addToOutline: createAddFunction("successMetric"),
    updateInOutline: createUpdateFunction("successMetric"),
    selectFromOutline: (outline: ContentOutline) => outline.successMetrics,
  },
  milestone: {
    ...milestoneDescriptor,
    addToOutline: createAddFunction("milestone"),
    updateInOutline: createUpdateFunction("milestone"),
    selectFromOutline: (outline: ContentOutline) => outline.milestones,
  },
  customerJourney: {
    ...customerJourneyDescriptor,
    addToOutline: createAddFunction("customerJourney"),
    updateInOutline: createUpdateFunction("customerJourney"),
    selectFromOutline: (outline: ContentOutline) => outline.customerJourneys,
  },
  metricSchema: {
    ...successMetricSchemaDescriptor,
    addToOutline: createAddFunction("metricSchema"),
    updateInOutline: createUpdateFunction("metricSchema"),
    selectFromOutline: (outline: ContentOutline) => outline.metricSchemas,
  },
};

export const getOutlineEntityMetadata = <K extends EditorKind>(kind: K) =>
  outlineEntityMetadata[kind];
