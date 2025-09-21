import { Terminal, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ApiKeyDialog, ErrorDisplay } from "@/components/error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeEditor } from "@/components/ui/code-editor";

import {
  MetricsDashboard,
  type WorkflowMetrics,
} from "@/components/ui/metrics-dashboard";

import { Separator } from "@/components/ui/separator";
import { Status } from "@/components/ui/status";
import { TerminalDisplay } from "@/components/ui/typing-text";

import {
  ProgressTimeline,
  WorkflowStatus,
} from "@/components/ui/workflow-status";

import { useSpecValidation } from "../hooks/useSpecValidation";
import { useStreamingWorkflow } from "../hooks/useStreamingWorkflow";

interface TraditionalModeProps {
  onStructuredMode: () => void;
}

// Constants for workflow timing estimates
const GENERATION_ESTIMATE_SECONDS = 30;
const VALIDATION_ESTIMATE_SECONDS = 10;
const SCORE_PENALTY_PER_ISSUE = 10;

export function TraditionalMode({ onStructuredMode }: TraditionalModeProps) {
  const [spec, setSpec] = useState<string>(
    "Project: Example\nTarget SKU: premium\n\n"
  );
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const {
    streaming,
    phase,
    attempt,
    draft,
    issues,
    startTime,
    elapsedTime,
    errorDetails,
    setElapsedTime,
    startWorkflow,
  } = useStreamingWorkflow();

  const validation = useSpecValidation(spec);

  // Track elapsed time during streaming
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (streaming && startTime > 0) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [streaming, startTime, setElapsedTime]);

  // Calculate workflow metrics
  const workflowMetrics: WorkflowMetrics = useMemo(() => {
    const wordCount = draft
      ? draft.split(/\s+/).filter((word) => word.length > 0).length
      : 0;
    const validationScore =
      issues.length === 0
        ? 100
        : Math.max(0, 100 - issues.length * SCORE_PENALTY_PER_ISSUE);
    const iterationAttempts = Math.max(0, attempt - 1);
    const estimatedCompletion =
      phase === "generating"
        ? GENERATION_ESTIMATE_SECONDS
        : phase === "validating"
          ? VALIDATION_ESTIMATE_SECONDS
          : undefined;

    return {
      wordCount,
      validationScore,
      iterationAttempts,
      elapsedTime,
      issuesFound: issues.length,
      phase,
      estimatedCompletion,
    };
  }, [draft, issues, attempt, elapsedTime, phase]);

  return (
    <div className="p-6 space-y-6">
      {/* Mode switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PRD Generator</h1>
          <p className="text-muted-foreground">
            Create comprehensive Product Requirements Documents with AI
            assistance
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onStructuredMode}
          className="flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Try Structured Wizard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            onChange={setSpec}
            title="PRD Specification Input"
            placeholder="Project: Example&#10;Target SKU: premium&#10;&#10;Objective: Brief description of what you want to build&#10;Target Users: Who will use this feature&#10;&#10;Enter your PRD specification here..."
            copyButton={true}
            showWordCount={true}
            maxWords={200}
            rows={14}
          />

          {/* Real-time validation feedback */}
          {validation.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Input Suggestions:
              </h4>
              <div className="space-y-1">
                {validation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested sections */}
          {validation.suggestedSections.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Suggested additions:
              </h4>
              <div className="space-y-1">
                {validation.suggestedSections.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
                    onClick={() => {
                      const newSpec = spec.trim() + "\n" + suggestion;
                      setSpec(newSpec);
                    }}
                  >
                    + {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => startWorkflow(spec)}
            disabled={streaming || validation.issues.length > 2}
          >
            Run
          </Button>

          {/* Enhanced Workflow Status */}
          <WorkflowStatus
            phase={phase}
            attempt={attempt}
            streaming={streaming}
          />

          {/* Progress Timeline */}
          <ProgressTimeline
            currentPhase={phase}
            attempt={attempt}
            maxAttempts={3}
          />

          {/* Real-time Metrics Dashboard */}
          <MetricsDashboard metrics={workflowMetrics} streaming={streaming} />
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-semibold">Draft</h2>

          {/* Enhanced Error Display */}
          {errorDetails ? (
            <ErrorDisplay
              error={errorDetails}
              onRetry={() => startWorkflow(spec)}
              onConfigureApi={() => {
                setShowApiKeyDialog(true);
              }}
            />
          ) : draft ? (
            <TerminalDisplay
              content={draft}
              title="PRD Generation Output"
              streaming={streaming}
            />
          ) : (
            <div className="min-h-[200px] flex items-center justify-center text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
              {streaming
                ? "Generating content..."
                : "Click 'Run' to generate your PRD"}
            </div>
          )}

          <Separator />
          <h3 className="text-md font-medium">Issues</h3>
          <div className="space-y-2">
            {issues.length === 0 ? (
              <div className="text-sm text-muted-foreground">None</div>
            ) : (
              issues.map((it, idx) => (
                <div key={idx} className="text-sm">
                  <Badge className="mr-2">{it.itemId}</Badge>
                  {it.message}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* API Key Configuration Dialog */}
      <ApiKeyDialog
        isOpen={showApiKeyDialog}
        onClose={() => setShowApiKeyDialog(false)}
      />
    </div>
  );
}
