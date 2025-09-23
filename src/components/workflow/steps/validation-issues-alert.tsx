import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Issue } from "@/lib/spec/types";

const MAX_ISSUES_TO_DISPLAY = 5;

export interface ValidationIssuesAlertProps {
  issues: Issue[];
}

export function ValidationIssuesAlert({ issues }: ValidationIssuesAlertProps) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium mb-2">Validation Issues Detected:</div>
        <ul className="list-disc list-inside space-y-1">
          {issues.slice(0, MAX_ISSUES_TO_DISPLAY).map((issue, index) => (
            <li key={index} className="text-sm">
              {issue.message}
            </li>
          ))}
          {issues.length > MAX_ISSUES_TO_DISPLAY && (
            <li className="text-sm text-muted-foreground">
              ...and {issues.length - MAX_ISSUES_TO_DISPLAY} more issues
            </li>
          )}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
