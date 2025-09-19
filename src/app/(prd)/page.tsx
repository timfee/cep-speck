"use client";

import { Wand2, Terminal } from "lucide-react";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";

import { ErrorDisplay, ApiKeyDialog } from "@/components/error";
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
  WorkflowStatus,
  ProgressTimeline,
} from "@/components/ui/workflow-status";
import { StructuredPrdWizard } from "@/components/workflow/StructuredPrdWizard";
import { INPUT_VALIDATION } from "@/lib/constants";

import type { ErrorDetails, ErrorCode } from "@/lib/error/types";
import type { Issue, StreamFrame } from "@/lib/spec/types";

type Mode = "structured" | "traditional";

// Constants for workflow timing estimates
const GENERATION_ESTIMATE_SECONDS = 30;
const VALIDATION_ESTIMATE_SECONDS = 10;

// Constants for validation scoring (UI-specific logic)
const SCORE_PENALTY_PER_ISSUE = 10;

// Type guard for StreamFrame
function isStreamFrame(obj: unknown): obj is StreamFrame {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "type" in obj &&
    "data" in obj &&
    typeof (obj as { type: unknown }).type === "string"
  );
}

// Type guard for ErrorCode
function isErrorCode(code: unknown): code is ErrorCode {
  return (
    typeof code === "string" &&
    [
      "MISSING_API_KEY",
      "NETWORK_TIMEOUT",
      "RATE_LIMITED",
      "VALIDATION_FAILED",
      "UNEXPECTED_ERROR",
      "SERVICE_UNAVAILABLE",
      "INVALID_INPUT",
    ].includes(code)
  );
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("structured");
  const [spec, setSpec] = useState<string>(
    "Project: Example\nTarget SKU: premium\n\n"
  );
  const [streaming, setStreaming] = useState(false);
  const [phase, setPhase] = useState<string>("");
  const [attempt, setAttempt] = useState<number>(0);
  const [draft, setDraft] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const textRef = useRef<string>("");

  // Real-time spec validation - simple local validation
  const validation = useMemo(() => {
    const trimmedSpec = spec.trim();
    if (!trimmedSpec) {
      return {
        issues: ["Specification is empty"],
        completionScore: 0,
        estimatedWordCount: 0,
        suggestedSections: [],
      };
    }

    const words = trimmedSpec.split(/\s+/);
    const hasProject = /^(?:project(?:\s+name)?|name|title)\s*[:=]\s*.+/im.test(trimmedSpec);
    const hasTargetSku = /^(?:target\s*)?(?:sku|tier|plan|edition)\s*[:=]\s*.+/im.test(trimmedSpec);
    const hasObjective = /^(?:objective|goal|purpose|aim|intent)\s*[:=]/im.test(trimmedSpec);

    const issues: string[] = [];

    if (!hasProject) issues.push("Missing project name");
    if (!hasTargetSku) issues.push("Missing target SKU");
    if (words.length < INPUT_VALIDATION.MIN_WORDS) issues.push("Specification seems too brief");

    const suggestedSections: string[] = [];
    if (!hasProject) suggestedSections.push("Project: [Your project name]");
    if (!hasTargetSku) suggestedSections.push("Target SKU: [premium|standard|enterprise]");
    if (!hasObjective) suggestedSections.push("Objective: [Primary goal]");

    let score = 0;
    if (hasProject) score += INPUT_VALIDATION.SCORE_INCREMENT;
    if (hasTargetSku) score += INPUT_VALIDATION.SCORE_INCREMENT;
    if (words.length >= INPUT_VALIDATION.MIN_SUBSTANTIAL_WORDS) score += INPUT_VALIDATION.SCORE_INCREMENT;
    if (words.length >= INPUT_VALIDATION.MIN_WORDS) score += INPUT_VALIDATION.SCORE_INCREMENT;

    return {
      issues,
      completionScore: Math.min(score, INPUT_VALIDATION.MAX_SCORE),
      estimatedWordCount: words.length,
      suggestedSections,
    };
  }, [spec]);

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
  }, [streaming, startTime]);

  // Calculate workflow metrics with memoization to avoid expensive recalculations
  const workflowMetrics: WorkflowMetrics = useMemo(() => {
    const wordCount = draft
      ? draft.split(/\s+/).filter((word) => word.length > 0).length
      : 0;
    const validationScore =
      issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * SCORE_PENALTY_PER_ISSUE);
    const healingAttempts = Math.max(0, attempt - 1);
    const estimatedCompletion =
      phase === "generating"
        ? GENERATION_ESTIMATE_SECONDS
        : phase === "validating"
          ? VALIDATION_ESTIMATE_SECONDS
          : undefined;

    return {
      wordCount,
      validationScore,
      healingAttempts,
      elapsedTime,
      issuesFound: issues.length,
      phase,
      estimatedCompletion,
    };
  }, [draft, issues, attempt, elapsedTime, phase]);

  const run = useCallback(async () => {
    setStreaming(true);
    setDraft("");
    textRef.current = "";
    setIssues([]);
    setErrorDetails(null);
    setPhase("starting");
    setAttempt(1);
    setStartTime(Date.now());
    setElapsedTime(0);

    const res = await fetch("/api/run", {
      method: "POST",
      body: JSON.stringify({ specText: spec }),
    });

    if (res.body === null) {
      setStreaming(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    // Stream reading pattern: continue until reader signals done
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        if (!line.trim()) continue;
        try {
          const parsed: unknown = JSON.parse(line);
          if (!isStreamFrame(parsed)) continue;
          const obj = parsed;

          if (obj.type === "phase") {
            setPhase(obj.data.phase);
            setAttempt(obj.data.attempt);
          }
          if (obj.type === "generation") {
            textRef.current += obj.data.delta;
            setDraft(textRef.current);
          }
          if (obj.type === "validation") {
            setIssues(obj.data.report.issues);
          }
          if (obj.type === "result") {
            setDraft(obj.data.finalDraft);
          }
          if (obj.type === "error") {
            setPhase("error");

            // Create enhanced error details
            const errorCode: ErrorCode = isErrorCode(obj.data.code)
              ? obj.data.code
              : "UNEXPECTED_ERROR";
            const errorDetails: ErrorDetails = {
              code: errorCode,
              message: obj.data.message,
              timestamp: Date.now(),
              phase,
              attempt,
              maxAttempts: 3,
              context: {
                specLength: spec.length,
                streaming: true,
              },
              details: obj.data.details,
            };

            setErrorDetails(errorDetails);
            setStreaming(false);
            break;
          }
        } catch (parseError) {
          // Skip invalid JSON lines - this is expected during streaming
          console.warn("Failed to parse streaming line:", line, {
            error: parseError instanceof Error ? parseError.message : String(parseError)
          });
          continue;
        }
      }
    }
    setStreaming(false);
  }, [spec, phase, attempt]);

  // Show structured wizard or traditional interface
  if (mode === "structured") {
    return (
      <div className="p-6">
        <StructuredPrdWizard onTraditionalMode={() => setMode("traditional")} />
      </div>
    );
  }

  // Traditional mode (original interface)
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
          onClick={() => setMode("structured")}
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
            onClick={run}
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
              onRetry={run}
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
