import { BarChart3, Calendar, Target } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import type { ContentOutline } from "@/types/workflow";

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

export function ContentSections({
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
}: ContentSectionsProps) {
  return (
    <>
      <ContentSection
        title="Functional Requirements"
        icon={<Target className="h-5 w-5 text-green-600" />}
        items={contentOutline.functionalRequirements}
        onAdd={handleAddFunctionalRequirement}
        onEdit={handleEditFunctionalRequirement}
        onDelete={onDeleteFunctionalRequirement}
        emptyMessage='No functional requirements generated. Click "Add Functional" to create one.'
        renderItem={(req) => ({
          id: req.id,
          title: req.title,
          description: req.description,
          badge: (
            <Badge
              variant={
                req.priority === "P0"
                  ? "destructive"
                  : req.priority === "P1"
                    ? "default"
                    : "secondary"
              }
            >
              {req.priority}
            </Badge>
          ),
          extra:
            (req.userStory ?? "").length > 0 ? (
              <div className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-500">
                <strong>User Story:</strong> {req.userStory}
              </div>
            ) : undefined,
        })}
      />

      <ContentSection
        title="Success Metrics"
        icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
        items={contentOutline.successMetrics}
        onAdd={handleAddSuccessMetric}
        onEdit={handleEditSuccessMetric}
        onDelete={onDeleteSuccessMetric}
        emptyMessage='No success metrics generated. Click "Add Success" to create one.'
        renderItem={(metric) => ({
          id: metric.id,
          title: metric.name,
          description: metric.description,
          badge: <Badge variant="outline">{metric.type}</Badge>,
          extra:
            (metric.target ?? "").length > 0 ? (
              <div className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-500">
                <strong>Target:</strong> {metric.target}
                {(metric.measurement ?? "").length > 0 && (
                  <span className="ml-2">
                    <strong>Measurement:</strong> {metric.measurement}
                  </span>
                )}
              </div>
            ) : undefined,
        })}
      />

      <ContentSection
        title="Milestones & Timeline"
        icon={<Calendar className="h-5 w-5 text-purple-600" />}
        items={contentOutline.milestones}
        onAdd={handleAddMilestone}
        onEdit={handleEditMilestone}
        onDelete={onDeleteMilestone}
        emptyMessage='No milestones generated. Click "Add Milestones" to create one.'
        renderItem={(milestone) => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          badge: <Badge variant="outline">{milestone.phase}</Badge>,
          extra:
            (milestone.estimatedDate ?? "").length > 0 ? (
              <div className="text-xs bg-purple-50 p-2 rounded border-l-2 border-purple-500">
                <strong>Estimated Date:</strong> {milestone.estimatedDate}
              </div>
            ) : undefined,
        })}
      />
    </>
  );
}
