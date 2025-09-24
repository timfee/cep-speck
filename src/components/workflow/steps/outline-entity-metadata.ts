import {
  addCustomerJourneyToOutline,
  addFunctionalRequirementToOutline,
  addMetricSchemaToOutline,
  addMilestoneToOutline,
  addSuccessMetricToOutline,
  updateCustomerJourneyInOutline,
  updateFunctionalRequirementInOutline,
  updateMetricSchemaInOutline,
  updateMilestoneInOutline,
  updateSuccessMetricInOutline,
} from "@/hooks/content-editing-utils";

import type { ContentOutline } from "@/types/workflow";

import { customerJourneyDescriptor } from "./customer-journey-helpers";
import { functionalRequirementDescriptor } from "./functional-requirement-helpers";

import type {
  DraftForKind,
  EditorKind,
  ItemForKind,
} from "./hooks/outline-editor-types";

import { successMetricSchemaDescriptor } from "./metric-schema-helpers";
import { milestoneDescriptor } from "./milestone-helpers";
import type { OutlineEntityMetadata } from "./outline-entity-descriptor";
import { successMetricDescriptor } from "./success-metric-helpers";

type OutlineEntityMetadataMap = {
  [K in EditorKind]: OutlineEntityMetadata<ItemForKind<K>, DraftForKind<K>>;
};

export const outlineEntityMetadata: OutlineEntityMetadataMap = {
  functionalRequirement: {
    ...functionalRequirementDescriptor,
    addToOutline: addFunctionalRequirementToOutline,
    updateInOutline: updateFunctionalRequirementInOutline,
    selectFromOutline: (outline: ContentOutline) =>
      outline.functionalRequirements,
  },
  successMetric: {
    ...successMetricDescriptor,
    addToOutline: addSuccessMetricToOutline,
    updateInOutline: updateSuccessMetricInOutline,
    selectFromOutline: (outline: ContentOutline) => outline.successMetrics,
  },
  milestone: {
    ...milestoneDescriptor,
    addToOutline: addMilestoneToOutline,
    updateInOutline: updateMilestoneInOutline,
    selectFromOutline: (outline: ContentOutline) => outline.milestones,
  },
  customerJourney: {
    ...customerJourneyDescriptor,
    addToOutline: addCustomerJourneyToOutline,
    updateInOutline: updateCustomerJourneyInOutline,
    selectFromOutline: (outline: ContentOutline) => outline.customerJourneys,
  },
  metricSchema: {
    ...successMetricSchemaDescriptor,
    addToOutline: addMetricSchemaToOutline,
    updateInOutline: updateMetricSchemaInOutline,
    selectFromOutline: (outline: ContentOutline) => outline.metricSchemas,
  },
};

export const getOutlineEntityMetadata = <K extends EditorKind>(kind: K) =>
  outlineEntityMetadata[kind];
