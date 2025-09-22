import { BarChart3, Calendar, Target } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";

import type {
  ContentOutline,
  FunctionalRequirement,
  SuccessMetric,
  Milestone,
} from "@/types/workflow";

import { ContentSection } from "./content-section";

interface ContentSectionsProps {
  contentOutline: ContentOutline;
  handleAddFunctionalRequirement: () => void;
  handleEditFunctionalRequirement: (id: string) => void;
  onDeleteFunctionalRequirement?: (id: string) => void;
  handleAddSuccessMetric: () => void;
  handleEditSuccessMetric: (id: string) => void;
  onDeleteSuccessMetric?: (id: string) => void;
  handleAddMilestone: () => void;
  handleEditMilestone: (id: string) => void;
  onDeleteMilestone?: (id: string) => void;
}

const createPriorityBadge = (priority: string) => (
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

const createUserStoryExtra = (userStory?: string) =>
  (userStory ?? "").length > 0 ? (
    <div className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-500">
      <strong>User Story:</strong> {userStory}
    </div>
  ) : undefined;

const createMetricExtra = (target?: string, measurement?: string) =>
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

const createDateExtra = (estimatedDate?: string) =>
  (estimatedDate ?? "").length > 0 ? (
    <div className="text-xs bg-purple-50 p-2 rounded border-l-2 border-purple-500">
      <strong>Estimated Date:</strong> {estimatedDate}
    </div>
  ) : undefined;

const SECTION_CONFIGS = {
  requirements: {
    title: "Functional Requirements",
    icon: <Target className="h-5 w-5 text-green-600" />,
    emptyMessage:
      'No functional requirements generated. Click "Add Functional" to create one.',
    renderer: (req: FunctionalRequirement) => ({
      id: req.id,
      title: req.title,
      description: req.description,
      badge: createPriorityBadge(req.priority),
      extra: createUserStoryExtra(req.userStory),
    }),
  },
  metrics: {
    title: "Success Metrics",
    icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
    emptyMessage:
      'No success metrics generated. Click "Add Success" to create one.',
    renderer: (metric: SuccessMetric) => ({
      id: metric.id,
      title: metric.name,
      description: metric.description,
      badge: <Badge variant="outline">{metric.type}</Badge>,
      extra: createMetricExtra(metric.target, metric.measurement),
    }),
  },
  milestones: {
    title: "Milestones & Timeline",
    icon: <Calendar className="h-5 w-5 text-purple-600" />,
    emptyMessage:
      'No milestones generated. Click "Add Milestones" to create one.',
    renderer: (milestone: Milestone) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      badge: <Badge variant="outline">{milestone.phase}</Badge>,
      extra: createDateExtra(milestone.estimatedDate),
    }),
  },
} as const;

export function ContentSections(props: ContentSectionsProps) {
  const {
    contentOutline,
    handleAddFunctionalRequirement,
    handleEditFunctionalRequirement,
    onDeleteFunctionalRequirement,
    handleAddSuccessMetric,
    handleEditSuccessMetric,
    onDeleteSuccessMetric,
    handleAddMilestone,
    handleEditMilestone,
    onDeleteMilestone,
  } = props;

  return (
    <>
      <ContentSection
        {...SECTION_CONFIGS.requirements}
        items={contentOutline.functionalRequirements}
        onAdd={handleAddFunctionalRequirement}
        onEdit={handleEditFunctionalRequirement}
        onDelete={onDeleteFunctionalRequirement}
        renderItem={SECTION_CONFIGS.requirements.renderer}
      />
      <ContentSection
        {...SECTION_CONFIGS.metrics}
        items={contentOutline.successMetrics}
        onAdd={handleAddSuccessMetric}
        onEdit={handleEditSuccessMetric}
        onDelete={onDeleteSuccessMetric}
        renderItem={SECTION_CONFIGS.metrics.renderer}
      />
      <ContentSection
        {...SECTION_CONFIGS.milestones}
        items={contentOutline.milestones}
        onAdd={handleAddMilestone}
        onEdit={handleEditMilestone}
        onDelete={onDeleteMilestone}
        renderItem={SECTION_CONFIGS.milestones.renderer}
      />
    </>
  );
}
