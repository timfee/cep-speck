import type { LucideIcon } from "lucide-react";

import { UI_CONSTANTS } from "@/lib/constants";
import { formatErrorForSupport } from "@/lib/error/classification";
import type { ErrorDetails, ErrorSeverityLevels } from "@/lib/error/types";

export function buildErrorLevels(
  error: ErrorDetails,
  severityIcon: LucideIcon
): ErrorSeverityLevels {
  return {
    user: {
      title: error.code, // Will be overridden by classification
      message: error.message,
      icon: severityIcon,
    },
    technical: {
      code: error.code,
      stack: error.stack,
      context: {
        phase: error.phase,
        attempt: error.attempt,
        maxAttempts: error.maxAttempts,
        timestamp: new Date(error.timestamp).toISOString(),
        ...error.context,
      },
    },
    support: {
      reportId: `ERR-${Date.now().toString(UI_CONSTANTS.HEX_RADIX).toUpperCase()}`,
      reproduction: [
        "1. Navigate to the PRD generation page",
        "2. Enter specification text",
        "3. Click 'Run' button",
        `4. Error occurred during ${error.phase ?? "unknown"} phase`,
      ],
      environment: {
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "Unknown",
        apiKeyPresent: !error.code.includes("MISSING_API_KEY"),
      },
    },
  };
}

export function buildSupportData(
  error: ErrorDetails,
  technicalContext: Record<string, unknown>
): string {
  return formatErrorForSupport({
    code: error.code,
    message: error.message,
    timestamp: error.timestamp,
    context: technicalContext,
    stack: error.stack,
  });
}
