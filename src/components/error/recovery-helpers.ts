import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Info,
  RefreshCw,
  Settings,
} from "lucide-react";

import { TIMEOUTS } from "@/lib/constants";
import type { ErrorDetails } from "@/lib/error/types";

export interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  icon: typeof RefreshCw;
  primary: boolean;
  handler: () => void;
}

export const ERROR_SEVERITY_STYLES = {
  critical: {
    border: "border-red-500",
    background: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-700 dark:text-red-300",
    icon: AlertTriangle,
  },
  warning: {
    border: "border-amber-500",
    background: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
    icon: AlertCircle,
  },
  info: {
    border: "border-blue-500",
    background: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-300",
    icon: Info,
  },
} as const;

export function getRecoveryActions(
  error: ErrorDetails,
  onRetry?: () => void,
  onConfigureApi?: () => void
): RecoveryAction[] {
  const actions: RecoveryAction[] = [];

  switch (error.code) {
    case "MISSING_API_KEY":
      if (onConfigureApi) {
        actions.push({
          id: "configure-api",
          label: "Configure API Key",
          description: "Add your Google Generative AI API key",
          icon: Settings,
          primary: true,
          handler: onConfigureApi,
        });
      }
      break;
    case "NETWORK_TIMEOUT":
    case "SERVICE_UNAVAILABLE":
      if (onRetry) {
        actions.push({
          id: "retry-now",
          label: "Retry Now",
          description: "Attempt the operation again",
          icon: RefreshCw,
          primary: true,
          handler: onRetry,
        });
      }
      break;
    case "RATE_LIMITED":
      if (onRetry) {
        actions.push({
          id: "wait-and-retry",
          label: "Wait & Retry",
          description: "Automatically retry after delay",
          icon: Clock,
          primary: true,
          handler: () => {
            setTimeout(() => onRetry(), TIMEOUTS.MEDIUM_DELAY);
          },
        });
      }
      break;
    case "VALIDATION_FAILED":
      // No specific recovery actions for validation failures
      break;
    case "UNEXPECTED_ERROR":
      if (onRetry) {
        actions.push({
          id: "retry-operation",
          label: "Try Again",
          description: "Retry the failed operation",
          icon: RefreshCw,
          primary: true,
          handler: onRetry,
        });
      }
      break;
    case "INVALID_INPUT":
      // User needs to correct their input - no automatic recovery
      break;
  }

  return actions;
}
