import { AlertTriangle, RefreshCw, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { EvaluationReport } from "@/lib/agents";

interface GenerateStepProps {
  error: string | null;
  status: "idle" | "outline" | "generating" | "evaluating" | "refining";
  isBusy: boolean;
  generatedPrd: string;
  evaluationReport: EvaluationReport | null;
  iteration: number;
  onGenerate: () => void;
  onReset: () => void;
}

function getStatusMessage(
  status: GenerateStepProps["status"],
  iteration: number
): string | null {
  switch (status) {
    case "generating":
      return "Draft in progress. Streaming the first version…";
    case "evaluating":
      return "Evaluating the draft against the style & principles guide…";
    case "refining":
      return `Applying refinements (iteration ${iteration}).`;
    case "outline":
      return "Outline ready. Generate a draft to continue.";
    case "idle":
      return null;
    default:
      return null;
  }
}

export function GenerateStep({
  error,
  status,
  isBusy,
  generatedPrd,
  evaluationReport,
  iteration,
  onGenerate,
  onReset,
}: GenerateStepProps) {
  const statusMessage = getStatusMessage(status, iteration);
  const issues = evaluationReport ?? [];
  const showIssues = issues.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Generate & Refine</h2>
        <p className="text-muted-foreground">
          We&apos;ll stream the draft, evaluate it, and automatically iterate
          until the quality bar is met or the refinement limit is reached.
        </p>
      </div>

      {error != null && (
        <Card className="p-4 border-destructive/40 bg-destructive/10 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="text-sm text-destructive">{error}</div>
        </Card>
      )}

      {statusMessage != null && statusMessage.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20 text-sm text-primary">
          {statusMessage}
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={onGenerate}
          disabled={isBusy}
          size="lg"
          className="min-w-44"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isBusy ? "Working..." : "Generate Draft"}
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isBusy}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Output
        </Button>
      </div>

      {generatedPrd.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Latest Draft</h3>
          <Card className="p-4 max-h-[420px] overflow-y-auto border-muted/40 bg-muted/5">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {generatedPrd}
            </pre>
          </Card>
        </div>
      )}

      {showIssues && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" /> Remaining Issues
          </h3>
          <Card className="p-4 space-y-3 border-amber-200 bg-amber-50">
            {issues.map((issue, index) => (
              <div key={`${issue.section}-${index}`} className="space-y-1">
                <div className="text-sm font-medium text-amber-800">
                  {issue.section}: {issue.issue}
                </div>
                {issue.suggestion != null && issue.suggestion.length > 0 && (
                  <p className="text-sm text-amber-700">
                    Suggestion: {issue.suggestion}
                  </p>
                )}
                {issue.evidence != null && issue.evidence.length > 0 && (
                  <p className="text-xs text-amber-700/80">
                    Evidence: {issue.evidence}
                  </p>
                )}
              </div>
            ))}
            <p className="text-xs text-amber-700/80">
              You can adjust the outline or notes above and regenerate to
              address these remaining findings.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
