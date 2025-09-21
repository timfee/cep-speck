import { Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeEditor } from "@/components/ui/code-editor";
import { MetricsDashboard } from "@/components/ui/metrics-dashboard";
import type { WorkflowMetrics } from "@/components/ui/metrics-dashboard";
import { Status } from "@/components/ui/status";

import {
  ProgressTimeline,
  WorkflowStatus,
} from "@/components/ui/workflow-status";

import { ValidationFeedback } from "./ValidationFeedback";

interface SpecValidation {
  issues: string[];
  suggestedSections: string[];
  completionScore: number;
  estimatedWordCount: number;
}

interface SpecSectionProps {
  spec: string;
  onSpecChange: (spec: string) => void;
  validation: SpecValidation;
  streaming: boolean;
  phase: string;
  attempt: number;
  workflowMetrics: WorkflowMetrics;
  onStartWorkflow: () => void;
}

/**
 * Component for the specification input section
 */
export function SpecSection({
  spec,
  onSpecChange,
  validation,
  streaming,
  phase,
  attempt,
  workflowMetrics,
  onStartWorkflow,
}: SpecSectionProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Spec</h2>
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Traditional Mode
          </span>
        </div>
      </div>

      {/* Real-time validation status */}
      <div className="flex flex-wrap items-center gap-2">
        <Status
          status={validation.issues.length === 0 ? "valid" : "invalid"}
          message={
            validation.issues.length === 0
              ? `Spec valid (${validation.completionScore}% complete)`
              : `${validation.issues.length} issue${validation.issues.length === 1 ? "" : "s"}`
          }
        />
        <Badge variant="outline" className="text-xs">
          {validation.estimatedWordCount} words
        </Badge>
      </div>

      {/* Enhanced code editor */}
      <CodeEditor
        value={spec}
        onChange={onSpecChange}
        title="PRD Specification Input"
        placeholder="Project: Example&#10;Target SKU: premium&#10;&#10;Objective: Brief description of what you want to build&#10;Target Users: Who will use this feature&#10;&#10;Enter your PRD specification here..."
        copyButton={true}
        showWordCount={true}
        maxWords={200}
        rows={14}
      />

      {/* Validation feedback component */}
      <ValidationFeedback
        issues={validation.issues}
        suggestedSections={validation.suggestedSections}
        spec={spec}
        onSpecChange={onSpecChange}
      />

      <Button
        onClick={onStartWorkflow}
        disabled={streaming || validation.issues.length > 2}
      >
        Run
      </Button>

      {/* Enhanced Workflow Status */}
      <WorkflowStatus phase={phase} attempt={attempt} streaming={streaming} />

      {/* Progress Timeline */}
      <ProgressTimeline
        currentPhase={phase}
        attempt={attempt}
        maxAttempts={3}
      />

      {/* Real-time Metrics Dashboard */}
      <MetricsDashboard metrics={workflowMetrics} streaming={streaming} />
    </Card>
  );
}
