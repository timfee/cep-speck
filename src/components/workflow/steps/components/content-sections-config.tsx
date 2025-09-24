/**
 * Content sections configuration and renderers
 */
import { BarChart3, Calendar, ListChecks, Route, Target } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

import type {
  ContentOutline,
  CustomerJourney,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
  SuccessMetricSchema,
} from "@/types/workflow";

import type { EditorKind, ItemForKind } from "../hooks/outline-editor-types";

const JOURNEY_STEP_PREVIEW_LIMIT = 3;
const METRIC_FIELD_PREVIEW_LIMIT = 3;

/**
 * Badge creation helpers
 */
export const createPriorityBadge = (priority: string) => (
  <Badge
    variant={
      priority === "P0"
        ? "destructive"
        : priority === "P1"
          ? "default"
          : "secondary"
    }
  >
    {priority}
  </Badge>
);

/**
 * Extra content renderers
 */
export const createUserStoryExtra = (userStory?: string) =>
  (userStory ?? "").length > 0 ? (
    <div className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-500">
      <strong>User Story:</strong> {userStory}
    </div>
  ) : undefined;

export const createMetricExtra = (target?: string, measurement?: string) =>
  (target ?? "").length > 0 ? (
    <div className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-500">
      <strong>Target:</strong> {target}
      {(measurement ?? "").length > 0 && (
        <span className="ml-2">
          <strong>Measurement:</strong> {measurement}
        </span>
      )}
    </div>
  ) : undefined;

export const createDateExtra = (estimatedDate?: string) =>
  (estimatedDate ?? "").length > 0 ? (
    <div className="text-xs bg-purple-50 p-2 rounded border-l-2 border-purple-500">
      <strong>Estimated Date:</strong> {estimatedDate}
    </div>
  ) : undefined;

type SectionConfig<K extends EditorKind> = {
  title: string;
  icon: ReactNode;
  addLabel: string;
  itemLabel: string;
  emptyMessage: string;
  renderer: (item: ItemForKind<K>) => {
    id: string;
    title: string;
    description: string;
    badge: ReactNode;
    extra?: ReactNode;
  };
  selectItems: (outline: ContentOutline) => ItemForKind<K>[];
};

type SectionConfigMap = { [K in EditorKind]: SectionConfig<K> };

/**
 * Section configuration with renderers
 */
export const SECTION_CONFIGS = {
  functionalRequirement: {
    title: "Functional Requirements",
    icon: <Target className="h-5 w-5 text-green-600" />,
    addLabel: "Add Requirement",
    itemLabel: "Functional Requirement",
    emptyMessage:
      'No functional requirements generated. Click "Add Requirement" to create one.',
    renderer: (req: FunctionalRequirement) => ({
      id: req.id,
      title: req.title,
      description: req.description,
      badge: createPriorityBadge(req.priority),
      extra: createUserStoryExtra(req.userStory),
    }),
    selectItems: (outline) => outline.functionalRequirements,
  },
  successMetric: {
    title: "Success Metrics",
    icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
    addLabel: "Add Metric",
    itemLabel: "Success Metric",
    emptyMessage:
      'No success metrics generated. Click "Add Metric" to create one.',
    renderer: (metric: SuccessMetric) => ({
      id: metric.id,
      title: metric.name,
      description: metric.description,
      badge: <Badge variant="outline">{metric.type}</Badge>,
      extra: createMetricExtra(metric.target, metric.measurement),
    }),
    selectItems: (outline) => outline.successMetrics,
  },
  milestone: {
    title: "Milestones & Timeline",
    icon: <Calendar className="h-5 w-5 text-purple-600" />,
    addLabel: "Add Milestone",
    itemLabel: "Milestone",
    emptyMessage:
      'No milestones generated. Click "Add Milestone" to create one.',
    renderer: (milestone: Milestone) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      badge: <Badge variant="outline">{milestone.phase}</Badge>,
      extra: createDateExtra(milestone.estimatedDate),
    }),
    selectItems: (outline) => outline.milestones,
  },
  customerJourney: {
    title: "Customer Journeys",
    icon: <Route className="h-5 w-5 text-amber-600" />,
    addLabel: "Add Journey",
    itemLabel: "Customer Journey",
    emptyMessage:
      'No customer journeys captured. Click "Add Journey" to document one.',
    renderer: (journey: CustomerJourney) => {
      const stepsPreview = journey.steps.slice(0, JOURNEY_STEP_PREVIEW_LIMIT);
      const remainingSteps = journey.steps.length - stepsPreview.length;
      const successCriteria = journey.successCriteria;
      const hasSuccessCriteria =
        typeof successCriteria === "string" && successCriteria.length > 0;
      return {
        id: journey.id,
        title: journey.title,
        description: journey.goal,
        badge: <Badge variant="outline">{journey.role}</Badge>,
        extra:
          stepsPreview.length > 0 ? (
            <div className="text-xs bg-amber-50 p-2 rounded border-l-2 border-amber-500 space-y-1">
              <strong>Steps:</strong>
              <ol className="ml-4 list-decimal space-y-1">
                {stepsPreview.map((step) => (
                  <li key={step.id}>{step.description}</li>
                ))}
              </ol>
              {remainingSteps > 0 ? (
                <div className="text-amber-700">
                  +{remainingSteps} more step{remainingSteps === 1 ? "" : "s"}
                </div>
              ) : null}
              {hasSuccessCriteria ? (
                <div>
                  <strong>Success:</strong> {successCriteria}
                </div>
              ) : null}
            </div>
          ) : undefined,
      };
    },
    selectItems: (outline) => outline.customerJourneys,
  },
  metricSchema: {
    title: "Metric Schemas",
    icon: <ListChecks className="h-5 w-5 text-sky-600" />,
    addLabel: "Add Metric Schema",
    itemLabel: "Metric Schema",
    emptyMessage:
      'No metric schemas defined. Click "Add Metric Schema" to capture one.',
    renderer: (schema: SuccessMetricSchema) => {
      const fieldNames = schema.fields.map((field) => field.name);
      const preview = fieldNames
        .slice(0, METRIC_FIELD_PREVIEW_LIMIT)
        .join(", ");
      const remaining =
        fieldNames.length -
        Math.min(fieldNames.length, METRIC_FIELD_PREVIEW_LIMIT);
      return {
        id: schema.id,
        title: schema.title,
        description: schema.description,
        badge: (
          <Badge variant="outline">
            {schema.fields.length} field{schema.fields.length === 1 ? "" : "s"}
          </Badge>
        ),
        extra:
          fieldNames.length > 0 ? (
            <div className="text-xs bg-sky-50 p-2 rounded border-l-2 border-sky-500">
              <strong>Fields:</strong> {preview}
              {remaining > 0 ? ` (+${remaining} more)` : ""}
            </div>
          ) : undefined,
      };
    },
    selectItems: (outline) => outline.metricSchemas,
  },
} as const satisfies SectionConfigMap;
