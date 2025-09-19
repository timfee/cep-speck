/**
 * Error classification and configuration system
 */

import type { ErrorCode, ErrorClassification } from "./types";

export const ERROR_CLASSIFICATIONS: Record<ErrorCode, ErrorClassification> = {
  MISSING_API_KEY: {
    code: "MISSING_API_KEY",
    severity: "critical",
    title: "API Key Required",
    message:
      "Google Generative AI API key is missing. Please configure your API key to continue.",
    recoverable: false,
    actions: ["configure-api-key"],
    status: "offline",
  },
  NETWORK_TIMEOUT: {
    code: "NETWORK_TIMEOUT",
    severity: "warning",
    title: "Network Timeout",
    message:
      "Request timed out. This usually resolves itself, please try again.",
    recoverable: true,
    actions: ["retry", "check-connection"],
    status: "degraded",
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    severity: "info",
    title: "Rate Limited",
    message:
      "Too many requests sent recently. Please wait a moment before retrying.",
    recoverable: true,
    actions: ["wait-and-retry"],
    status: "degraded",
  },
  VALIDATION_FAILED: {
    code: "VALIDATION_FAILED",
    severity: "warning",
    title: "Validation Issues",
    message:
      "Generated content doesn't meet validation requirements and needs correction.",
    recoverable: true,
    actions: ["manual-edit", "regenerate"],
    status: "degraded",
  },
  SERVICE_UNAVAILABLE: {
    code: "SERVICE_UNAVAILABLE",
    severity: "critical",
    title: "Service Unavailable",
    message: "AI service is currently unavailable. Please try again later.",
    recoverable: true,
    actions: ["retry", "check-status"],
    status: "offline",
  },
  INVALID_INPUT: {
    code: "INVALID_INPUT",
    severity: "warning",
    title: "Invalid Input",
    message: "The specification input contains errors or is incomplete.",
    recoverable: true,
    actions: ["edit-input", "use-template"],
    status: "degraded",
  },
  UNEXPECTED_ERROR: {
    code: "UNEXPECTED_ERROR",
    severity: "critical",
    title: "Unexpected Error",
    message:
      "An unexpected error occurred. This has been logged for investigation.",
    recoverable: false,
    actions: ["report-error", "restart"],
    status: "offline",
  },
};

/**
 * Classify an error based on its properties
 */
export function classifyError(error: {
  message: string;
  code?: string;
  recoverable?: boolean;
}): ErrorClassification {
  // Map common error codes to our classification system
  if (
    error.code === "MISSING_API_KEY" ||
    error.message.includes("Missing GOOGLE_GENERATIVE_AI_API_KEY")
  ) {
    return ERROR_CLASSIFICATIONS.MISSING_API_KEY;
  }

  if (
    error.code === "NETWORK_TIMEOUT" ||
    error.message.includes("timeout") ||
    error.message.includes("network")
  ) {
    return ERROR_CLASSIFICATIONS.NETWORK_TIMEOUT;
  }

  if (
    error.code === "RATE_LIMITED" ||
    error.message.includes("rate limit") ||
    error.message.includes("too many requests")
  ) {
    return ERROR_CLASSIFICATIONS.RATE_LIMITED;
  }

  if (
    error.code === "VALIDATION_FAILED" ||
    error.message.includes("validation")
  ) {
    return ERROR_CLASSIFICATIONS.VALIDATION_FAILED;
  }

  if (
    error.code === "SERVICE_UNAVAILABLE" ||
    error.message.includes("unavailable") ||
    error.message.includes("service")
  ) {
    return ERROR_CLASSIFICATIONS.SERVICE_UNAVAILABLE;
  }

  if (
    error.code === "INVALID_INPUT" ||
    error.message.includes("invalid") ||
    error.message.includes("malformed")
  ) {
    return ERROR_CLASSIFICATIONS.INVALID_INPUT;
  }

  // Default to unexpected error
  return ERROR_CLASSIFICATIONS.UNEXPECTED_ERROR;
}

/**
 * Format error for support reporting
 */
export function formatErrorForSupport(error: {
  code: string;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
  stack?: string;
}): string {
  const lines = [
    `Error Code: ${error.code}`,
    `Message: ${error.message}`,
    `Timestamp: ${new Date(error.timestamp).toISOString()}`,
    `User Agent: ${typeof navigator !== "undefined" ? navigator?.userAgent : "N/A"}`,
    `URL: ${typeof window !== "undefined" ? window.location.href : "N/A"}`,
  ];

  if (error.context) {
    lines.push(`Context: ${JSON.stringify(error.context, null, 2)}`);
  }

  if (error.stack) {
    lines.push(`Stack: ${error.stack}`);
  }

  return lines.join("\n");
}
