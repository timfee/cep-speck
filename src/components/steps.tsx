"use client";

import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
          <label htmlFor="product-description" className="text-sm font-medium">Product Description</label>
          <Textarea
            id="product-description"
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

export function OutlineStep({ data, isPending, onDataChange, onGenerate }: StepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<number | null>(null);
  const [editingMetric, setEditingMetric] = useState<number | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<number | null>(null);

  const updateRequirement = (index: number, field: 'title' | 'description', value: string) => {
    if (!data.outline) return;
    
    const updated = { ...data.outline };
    updated.functional_requirements = [...updated.functional_requirements];
    updated.functional_requirements[index] = {
      ...updated.functional_requirements[index],
      [field]: value
    };
    
    onDataChange({ ...data, outline: updated });
  };

  const updateMetric = (index: number, field: 'name' | 'target', value: string) => {
    if (!data.outline) return;
    
    const updated = { ...data.outline };
    updated.success_metrics = [...updated.success_metrics];
    updated.success_metrics[index] = {
      ...updated.success_metrics[index],
      [field]: value
    };
    
    onDataChange({ ...data, outline: updated });
  };

  const updateMilestone = (index: number, field: 'title' | 'timeline', value: string) => {
    if (!data.outline) return;
    
    const updated = { ...data.outline };
    updated.milestones = [...updated.milestones];
    updated.milestones[index] = {
      ...updated.milestones[index],
      [field]: value
    };
    
    onDataChange({ ...data, outline: updated });
  };

  const addRequirement = () => {
    if (!data.outline) return;
    
    const updated = { ...data.outline };
    updated.functional_requirements = [
      ...updated.functional_requirements,
      {
        id: `req-${updated.functional_requirements.length + 1}`,
        title: 'New Requirement',
        description: 'Describe the requirement details...'
      }
    ];
    
    onDataChange({ ...data, outline: updated });
  };

  const removeRequirement = (index: number) => {
    if (!data.outline) return;
    
    const updated = { ...data.outline };
    updated.functional_requirements = updated.functional_requirements.filter((_, i) => i !== index);
    
    onDataChange({ ...data, outline: updated });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Content Outline</h2>
          {data.outline && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Done Editing" : "Edit Outline"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerate}
              >
                Regenerate
              </Button>
            </div>
          )}
        </div>

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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Functional Requirements</h3>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={addRequirement}>
                    Add Requirement
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {data.outline.functional_requirements.map((req, i) => (
                  <div key={req.id} className="p-3 bg-muted rounded relative">
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => removeRequirement(i)}
                      >
                        ×
                      </Button>
                    )}
                    {isEditing && editingRequirement === i ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={req.title}
                          onChange={(e) => updateRequirement(i, 'title', e.target.value)}
                          className="w-full font-medium bg-transparent border-b border-gray-300 focus:border-primary outline-none"
                          onBlur={() => setEditingRequirement(null)}
                          autoFocus
                        />
                        <textarea
                          value={req.description}
                          onChange={(e) => updateRequirement(i, 'description', e.target.value)}
                          className="w-full text-sm text-muted-foreground bg-transparent border border-gray-300 rounded p-2 focus:border-primary outline-none"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => isEditing && setEditingRequirement(i)}
                        className={isEditing ? "cursor-pointer hover:bg-gray-50 -m-1 p-1 rounded" : ""}
                      >
                        <div className="font-medium">{req.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {req.description}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Success Metrics</h3>
              <div className="space-y-2">
                {data.outline.success_metrics.map((metric, i) => (
                  <div key={metric.id} className="p-3 bg-muted rounded">
                    {isEditing && editingMetric === i ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={metric.name}
                          onChange={(e) => updateMetric(i, 'name', e.target.value)}
                          className="w-full font-medium bg-transparent border-b border-gray-300 focus:border-primary outline-none"
                          onBlur={() => setEditingMetric(null)}
                          autoFocus
                        />
                        <input
                          type="text"
                          value={metric.target}
                          onChange={(e) => updateMetric(i, 'target', e.target.value)}
                          className="w-full text-sm text-muted-foreground bg-transparent border border-gray-300 rounded p-2 focus:border-primary outline-none"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => isEditing && setEditingMetric(i)}
                        className={isEditing ? "cursor-pointer hover:bg-gray-50 -m-1 p-1 rounded" : ""}
                      >
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Target: {metric.target}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Milestones</h3>
              <div className="space-y-2">
                {data.outline.milestones.map((milestone, i) => (
                  <div key={milestone.id} className="p-3 bg-muted rounded">
                    {isEditing && editingMilestone === i ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                          className="w-full font-medium bg-transparent border-b border-gray-300 focus:border-primary outline-none"
                          onBlur={() => setEditingMilestone(null)}
                          autoFocus
                        />
                        <input
                          type="text"
                          value={milestone.timeline}
                          onChange={(e) => updateMilestone(i, 'timeline', e.target.value)}
                          className="w-full text-sm text-muted-foreground bg-transparent border border-gray-300 rounded p-2 focus:border-primary outline-none"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => isEditing && setEditingMilestone(i)}
                        className={isEditing ? "cursor-pointer hover:bg-gray-50 -m-1 p-1 rounded" : ""}
                      >
                        <div className="font-medium">{milestone.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {milestone.timeline}
                        </div>
                      </div>
                    )}
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
          Configure deployment and security settings
        </p>

        <div className="space-y-4">
          {/* Deployment Settings */}
          <div className="p-4 bg-muted rounded">
            <h3 className="font-medium mb-2">Deployment Configuration</h3>
            <p className="text-sm text-muted-foreground mb-2">Standard cloud deployment selected</p>
            <RadioGroup defaultValue="cloud" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cloud" id="cloud" />
                <Label htmlFor="cloud" className="text-sm">Cloud Deployment - Scalable and managed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hybrid" id="hybrid" />
                <Label htmlFor="hybrid" className="text-sm">Hybrid Deployment - Cloud and on-premises</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="onprem" id="onprem" />
                <Label htmlFor="onprem" className="text-sm">On-Premises - Full control and compliance</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Security Settings */}
          <div className="p-4 bg-muted rounded">
            <h3 className="font-medium mb-2">Security Policies</h3>
            <p className="text-sm text-muted-foreground mb-2">Enterprise security policies applied</p>
            <RadioGroup defaultValue="enterprise" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="basic" id="basic" />
                <Label htmlFor="basic" className="text-sm">Basic Security - Standard protection</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="enterprise" id="enterprise" />
                <Label htmlFor="enterprise" className="text-sm">Enterprise Security - Advanced protection & compliance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="text-sm">Custom Security - Tailored security policies</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Performance Settings */}
          <div className="p-4 bg-muted rounded">
            <h3 className="font-medium mb-2">Performance Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Scaling</Label>
                <RadioGroup defaultValue="auto" className="mt-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="text-xs">Auto-scaling</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="text-xs">Fixed capacity</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label className="text-sm font-medium">Region</Label>
                <RadioGroup defaultValue="global" className="mt-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="us" id="us" />
                    <Label htmlFor="us" className="text-xs">US Region</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eu" id="eu" />
                    <Label htmlFor="eu" className="text-xs">EU Region</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="global" id="global" />
                    <Label htmlFor="global" className="text-xs">Global</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
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
