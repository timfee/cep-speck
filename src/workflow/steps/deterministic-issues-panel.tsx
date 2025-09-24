import { AlertTriangle, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Issue } from "@/lib/spec/types";

interface DeterministicIssuesPanelProps {
  issues: Issue[];
  onRetry: () => Promise<void> | void;
  onRefine: () => Promise<void> | void;
  isRefining: boolean;
  isGenerating: boolean;
}

const MAX_ISSUES_PREVIEW = 4;

export function DeterministicIssuesPanel({
  issues,
  onRetry,
  onRefine,
  isRefining,
  isGenerating,
}: DeterministicIssuesPanelProps) {
  if (issues.length === 0) {
    return null;
  }

  const disabled = isGenerating || isRefining;

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="space-y-3">
        <div className="flex items-center gap-2 text-amber-800">
          <span className="font-semibold">Deterministic issues detected</span>
        </div>
        <p className="text-sm text-amber-700">
          Resolve these blocking validation issues before finalizing the PRD.
        </p>

        <ul className="space-y-1 text-sm text-amber-800">
          {issues.slice(0, MAX_ISSUES_PREVIEW).map((issue) => (
            <li key={issue.id}>
              <span className="font-medium">{issue.message}</span>
              {typeof issue.evidence === "string" &&
                issue.evidence.length > 0 && (
                  <span className="ml-2 text-amber-700/80">
                    {issue.evidence}
                  </span>
                )}
            </li>
          ))}
          {issues.length > MAX_ISSUES_PREVIEW && (
            <li className="text-amber-600">
              +{issues.length - MAX_ISSUES_PREVIEW} more issues
            </li>
          )}
        </ul>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={disabled}
          >
            Retry generation
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onRefine}
            disabled={disabled}
          >
            {isRefining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refine with AI
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
