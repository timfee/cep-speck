"use client";

import { 
  CheckCircle, 
  Edit3, 
  Plus,
  Target,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import type { ContentOutline, FunctionalRequirement, SuccessMetric, Milestone } from '@/types/workflow';

interface ContentOutlineStepProps {
  initialPrompt: string;
  contentOutline: ContentOutline;
  onChange: (outline: ContentOutline) => void;
  onRegenerateOutline: () => void;
  isLoading?: boolean;
}

export function ContentOutlineStep({
  initialPrompt,
  contentOutline,
  onChange,
  onRegenerateOutline,
  isLoading = false
}: ContentOutlineStepProps) {
  const totalItems = 
    contentOutline.functionalRequirements.length + 
    contentOutline.successMetrics.length + 
    contentOutline.milestones.length;

  const addFunctionalRequirement = () => {
    const newReq: FunctionalRequirement = {
      id: `fr-${Date.now()}`,
      title: 'New Functional Requirement',
      description: 'Enter description here',
      priority: 'P1'
    };
    onChange({
      ...contentOutline,
      functionalRequirements: [...contentOutline.functionalRequirements, newReq]
    });
  };

  const addSuccessMetric = () => {
    const newMetric: SuccessMetric = {
      id: `sm-${Date.now()}`,
      name: 'New Success Metric',
      description: 'Enter description here',
      type: 'engagement'
    };
    onChange({
      ...contentOutline,
      successMetrics: [...contentOutline.successMetrics, newMetric]
    });
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: `ms-${Date.now()}`,
      title: 'New Milestone',
      description: 'Enter description here',
      phase: 'development'
    };
    onChange({
      ...contentOutline,
      milestones: [...contentOutline.milestones, newMilestone]
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review Content Outline</h2>
        <p className="text-muted-foreground">
          AI has generated functional requirements, metrics, and milestones based on your product description. 
          Review and customize these before generating the final PRD.
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
            <CheckCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
            <strong>Based on:</strong> &quot;{initialPrompt.slice(0, 100)}{initialPrompt.length > 100 ? '...' : ''}&quot;
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {totalItems} total items
            </Badge>
            <Badge variant="outline">
              {contentOutline.functionalRequirements.length} functional requirements
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

      {/* Functional Requirements */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Functional Requirements
          </h3>
          <Button size="sm" variant="outline" onClick={addFunctionalRequirement}>
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </div>
        
        <div className="space-y-3">
          {contentOutline.functionalRequirements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No functional requirements generated. Click &quot;Add Requirement&quot; to create one.
            </div>
          ) : (
            contentOutline.functionalRequirements.map((req) => (
              <div key={req.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={req.priority === 'P0' ? 'destructive' : req.priority === 'P1' ? 'default' : 'secondary'}>
                      {req.priority}
                    </Badge>
                    <h4 className="font-medium">{req.title}</h4>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{req.description}</p>
                {req.userStory && (
                  <div className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-500">
                    <strong>User Story:</strong> {req.userStory}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Success Metrics */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Success Metrics
          </h3>
          <Button size="sm" variant="outline" onClick={addSuccessMetric}>
            <Plus className="h-4 w-4 mr-2" />
            Add Metric
          </Button>
        </div>
        
        <div className="space-y-3">
          {contentOutline.successMetrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No success metrics generated. Click &quot;Add Metric&quot; to create one.
            </div>
          ) : (
            contentOutline.successMetrics.map((metric) => (
              <div key={metric.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{metric.type}</Badge>
                    <h4 className="font-medium">{metric.name}</h4>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
                {metric.target && (
                  <div className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-500">
                    <strong>Target:</strong> {metric.target}
                    {metric.measurement && <span className="ml-2"><strong>Measurement:</strong> {metric.measurement}</span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Milestones */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Milestones & Timeline
          </h3>
          <Button size="sm" variant="outline" onClick={addMilestone}>
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </div>
        
        <div className="space-y-3">
          {contentOutline.milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No milestones generated. Click &quot;Add Milestone&quot; to create one.
            </div>
          ) : (
            contentOutline.milestones.map((milestone) => (
              <div key={milestone.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{milestone.phase}</Badge>
                    <h4 className="font-medium">{milestone.title}</h4>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                {milestone.estimatedDate && (
                  <div className="text-xs bg-purple-50 p-2 rounded border-l-2 border-purple-500">
                    <strong>Estimated Date:</strong> {milestone.estimatedDate}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Summary validation */}
      {totalItems > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
            <CheckCircle className="h-4 w-4" />
            <span>
              Content outline looks comprehensive. You can proceed to configure enterprise parameters.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}