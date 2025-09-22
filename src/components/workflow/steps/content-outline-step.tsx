"use client";

import {
  BarChart3,
  Calendar,
  CheckCircle,
  FileText,
  Target,
} from "lucide-react";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type {
  ContentOutline,
  FunctionalRequirement,
  Milestone,
  SuccessMetric,
} from "@/types/workflow";

import { ContentSection } from "./components/content-section";

interface ContentOutlineStepProps {
  initialPrompt: string;
  contentOutline: ContentOutline;
  onChange: (outline: ContentOutline) => void;
  onRegenerateOutline: () => void;
  isLoading?: boolean;
  // Editing functions
  onEditFunctionalRequirement?: (id: string, updates: Partial<FunctionalRequirement>) => void;
  onDeleteFunctionalRequirement?: (id: string) => void;
  onAddFunctionalRequirement?: (requirement: FunctionalRequirement) => void;
  onEditSuccessMetric?: (id: string, updates: Partial<SuccessMetric>) => void;
  onDeleteSuccessMetric?: (id: string) => void;
  onAddSuccessMetric?: (metric: SuccessMetric) => void;
  onEditMilestone?: (id: string, updates: Partial<Milestone>) => void;
  onDeleteMilestone?: (id: string) => void;
  onAddMilestone?: (milestone: Milestone) => void;
}

export function ContentOutlineStep({
  initialPrompt,
  contentOutline,
  onChange,
  onRegenerateOutline,
  isLoading = false,
  onEditFunctionalRequirement: _onEditFunctionalRequirement,
  onDeleteFunctionalRequirement,
  onAddFunctionalRequirement,
  onEditSuccessMetric: _onEditSuccessMetric,
  onDeleteSuccessMetric,
  onAddSuccessMetric,
  onEditMilestone: _onEditMilestone,
  onDeleteMilestone,
  onAddMilestone,
}: ContentOutlineStepProps) {
  const totalItems =
    contentOutline.functionalRequirements.length +
    contentOutline.successMetrics.length +
    contentOutline.milestones.length;

  const handleAddFunctionalRequirement = () => {
    if (onAddFunctionalRequirement) {
      const newReq: FunctionalRequirement = {
        id: `fr-${Date.now()}`,
        title: "New Functional Requirement",
        description: "Enter description here",
        priority: "P1",
      };
      onAddFunctionalRequirement(newReq);
    } else {
      const newReq: FunctionalRequirement = {
        id: `fr-${Date.now()}`,
        title: "New Functional Requirement",
        description: "Enter description here",
        priority: "P1",
      };
      onChange({
        ...contentOutline,
        functionalRequirements: [
          ...contentOutline.functionalRequirements,
          newReq,
        ],
      });
    }
  };

  const handleAddSuccessMetric = () => {
    if (onAddSuccessMetric) {
      const newMetric: SuccessMetric = {
        id: `sm-${Date.now()}`,
        name: "New Success Metric",
        description: "Enter description here",
        type: "engagement",
      };
      onAddSuccessMetric(newMetric);
    } else {
      const newMetric: SuccessMetric = {
        id: `sm-${Date.now()}`,
        name: "New Success Metric",
        description: "Enter description here",
        type: "engagement",
      };
      onChange({
        ...contentOutline,
        successMetrics: [...contentOutline.successMetrics, newMetric],
      });
    }
  };

  const handleAddMilestone = () => {
    if (onAddMilestone) {
      const newMilestone: Milestone = {
        id: `ms-${Date.now()}`,
        title: "New Milestone",
        description: "Enter description here",
        phase: "development",
      };
      onAddMilestone(newMilestone);
    } else {
      const newMilestone: Milestone = {
        id: `ms-${Date.now()}`,
        title: "New Milestone",
        description: "Enter description here",
        phase: "development",
      };
      onChange({
        ...contentOutline,
        milestones: [...contentOutline.milestones, newMilestone],
      });
    }
  };

  // Edit handlers - for now just console log to test the connection
  const handleEditFunctionalRequirement = (id: string) => {
    console.log("Edit functional requirement:", id);
    // TODO: Open edit dialog
  };

  const handleEditSuccessMetric = (id: string) => {
    console.log("Edit success metric:", id);
    // TODO: Open edit dialog
  };

  const handleEditMilestone = (id: string) => {
    console.log("Edit milestone:", id);
    // TODO: Open edit dialog
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review Content Outline</h2>
        <p className="text-muted-foreground">
          AI has generated functional requirements, metrics, and milestones
          based on your product description. Review and customize these before
          generating the final PRD.
        </p>
      </div>

      {/* Summary card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            AI-Generated Content Outline
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateOutline}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <CheckCircle
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Regenerate
          </Button>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
            <strong>Based on:</strong> &quot;{initialPrompt.slice(0, 100)}
            {initialPrompt.length > 100 ? "..." : ""}&quot;
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{totalItems} total items</Badge>
            <Badge variant="outline">
              {contentOutline.functionalRequirements.length} functional
              requirements
            </Badge>
            <Badge variant="outline">
              {contentOutline.successMetrics.length} metrics
            </Badge>
            <Badge variant="outline">
              {contentOutline.milestones.length} milestones
            </Badge>
          </div>
        </div>
      </Card>

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

      {/* Summary validation */}
      {totalItems > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
            <CheckCircle className="h-4 w-4" />
            <span>
              Content outline looks comprehensive. You can proceed to configure
              enterprise parameters.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
