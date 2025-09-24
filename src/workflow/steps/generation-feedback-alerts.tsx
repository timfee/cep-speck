import { AlertCircle, CheckCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ErrorAlertProps {
  message: string | null;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (typeof message !== "string" || message.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export interface SuccessAlertProps {
  shouldShow: boolean;
  hasValidationIssues: boolean;
}

export function SuccessAlert({
  shouldShow,
  hasValidationIssues,
}: SuccessAlertProps) {
  if (!shouldShow) {
    return null;
  }

  return (
    <Alert>
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>
        PRD generation completed successfully!
        {!hasValidationIssues && " All validation checks passed."}
      </AlertDescription>
    </Alert>
  );
}
