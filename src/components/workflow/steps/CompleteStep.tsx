import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { EvaluationReport } from "@/lib/agents";

interface CompleteStepProps {
  generatedPrd: string;
  evaluationReport: EvaluationReport | null;
  refinementLimitReached?: boolean;
}

export function CompleteStep({
  generatedPrd,
  evaluationReport,
  refinementLimitReached = false,
}: CompleteStepProps) {
  const issues = evaluationReport ?? [];
  const hasIssues = issues.length > 0;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrd);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">PRD Complete</h2>
        <p className="text-muted-foreground mb-6">
          Your PRD has been successfully generated and validated by the agentic
          outline → draft → evaluate → refine workflow.
        </p>
      </div>

      {generatedPrd.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Final PRD:</h3>
            <Button variant="outline" onClick={handleCopyToClipboard}>
              Copy to Clipboard
            </Button>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{generatedPrd}</pre>
          </div>
        </div>
      )}

      {!hasIssues && generatedPrd.length > 0 && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <Badge
              variant="outline"
              className="border-green-400 text-green-700"
            >
              ✅ Quality Check Passed
            </Badge>
            No outstanding issues were detected by the evaluator.
          </div>
        </Card>
      )}

      {hasIssues && (
        <Card className="p-4 space-y-3 border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-amber-700">
              Remaining Issues
            </h3>
            {refinementLimitReached && (
              <Badge
                variant="outline"
                className="border-amber-400 text-amber-700"
              >
                Refinement limit reached
              </Badge>
            )}
          </div>
          {issues.map((issue, index) => (
            <div key={`${issue.section}-${index}`} className="space-y-1">
              <p className="text-sm font-medium text-amber-800">
                {issue.section}: {issue.issue}
              </p>
              {issue.suggestion != null && issue.suggestion.length > 0 && (
                <p className="text-sm text-amber-700">
                  Suggested Fix: {issue.suggestion}
                </p>
              )}
            </div>
          ))}
          <p className="text-xs text-amber-700/80">
            Consider updating the outline or notes and regenerating to resolve
            these issues.
          </p>
        </Card>
      )}
    </div>
  );
}
