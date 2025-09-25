"use client";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface PRDData {
  prompt: string;
  outline?: {
    functional_requirements: Array<{
      id: string;
      title: string;
      description: string;
    }>;
    success_metrics: Array<{
      id: string;
      name: string;
      target: string;
    }>;
    milestones: Array<{
      id: string;
      title: string;
      timeline: string;
    }>;
  };
  prd?: {
    title: string;
    overview: string;
    objectives: string[];
    requirements: Array<{
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
    }>;
    timeline: string;
    success_metrics: string[];
  };
}

interface StepProps {
  data: PRDData;
  onDataChange: (data: PRDData) => void;
  isPending?: boolean;
  onGenerate?: () => void;
}

export function IdeaStep({ data, onDataChange }: StepProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Describe Your Product Idea</h2>
          <p className="text-muted-foreground">
            Tell us about your product concept. The more detail you provide, the
            better we can structure your PRD.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Product Description</label>
          <Textarea
            value={data.prompt}
            onChange={(e) => onDataChange({ ...data, prompt: e.target.value })}
            placeholder="Describe your product idea here..."
            rows={6}
            className="min-h-32"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{data.prompt.length} characters</span>
            <span>Markdown-like format</span>
          </div>
        </div>

        {data.prompt.length < 10 && (
          <p className="text-sm text-amber-600">
            💡 Tip: Provide at least a few sentences to get the best section
            suggestions.
          </p>
        )}
      </div>
    </Card>
  );
}

export function OutlineStep({ data, isPending, onGenerate }: StepProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Content Outline</h2>

        {isPending === true ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Generating outline...
            </p>
          </div>
        ) : data.outline != null ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Functional Requirements</h3>
              <div className="space-y-2 mt-2">
                {data.outline.functional_requirements.map((req, i) => (
                  <div key={i} className="p-3 bg-muted rounded">
                    <div className="font-medium">{req.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {req.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Success Metrics</h3>
              <div className="space-y-2 mt-2">
                {data.outline.success_metrics.map((metric, i) => (
                  <div key={i} className="p-3 bg-muted rounded">
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Target: {metric.target}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Milestones</h3>
              <div className="space-y-2 mt-2">
                {data.outline.milestones.map((milestone, i) => (
                  <div key={i} className="p-3 bg-muted rounded">
                    <div className="font-medium">{milestone.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {milestone.timeline}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Button onClick={onGenerate}>Generate Outline</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export function SettingsStep() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Enterprise Settings</h2>
        <p className="text-muted-foreground">
          Configure deployment and security settings (optional).
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded">
            <h3 className="font-medium">Deployment Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Standard cloud deployment selected
            </p>
          </div>

          <div className="p-4 bg-muted rounded">
            <h3 className="font-medium">Security Settings</h3>
            <p className="text-sm text-muted-foreground">
              Enterprise security policies applied
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function GenerateStep({ data, isPending, onGenerate }: StepProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Generate PRD</h2>

        {isPending === true ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Generating PRD...
            </p>
          </div>
        ) : data.prd != null ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded">
              <h3 className="text-lg font-semibold">{data.prd.title}</h3>
              <p className="mt-2">{data.prd.overview}</p>
            </div>

            <div>
              <h4 className="font-medium">Objectives</h4>
              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                {data.prd.objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Requirements</h4>
              <div className="space-y-2 mt-2">
                {data.prd.requirements.map((req, i) => (
                  <div key={i} className="p-3 bg-muted rounded">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{req.title}</div>
                      <Badge
                        variant={
                          req.priority === "high"
                            ? "destructive"
                            : req.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {req.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {req.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium">Timeline</h4>
              <p className="text-sm mt-1">{data.prd.timeline}</p>
            </div>

            <div>
              <h4 className="font-medium">Success Metrics</h4>
              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                {data.prd.success_metrics.map((metric, i) => (
                  <li key={i}>{metric}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Button onClick={onGenerate}>Generate PRD</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export function CompleteStep() {
  return (
    <Card className="p-6">
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">PRD Complete!</h2>
        <p className="text-muted-foreground">
          Your Product Requirements Document has been generated successfully.
        </p>

        <div className="flex justify-center space-x-4">
          <Button variant="outline">Download PDF</Button>
          <Button>Share PRD</Button>
        </div>
      </div>
    </Card>
  );
}
