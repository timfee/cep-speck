/**
 * Error classification and configuration system
 */

import { findErrorClassification } from "./matchers";
import type { ErrorClassification } from "./types";

/**
 * Classify an error based on its properties
 */
export function classifyError(error: {
  message: string;
  code?: string;
  recoverable?: boolean;
}): ErrorClassification {
  return findErrorClassification(error);
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
    `User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}`,
    `URL: ${typeof window !== "undefined" ? window.location.href : "N/A"}`,
  ];

  if (error.context) {
    lines.push(`Context: ${JSON.stringify(error.context, null, 2)}`);
  }

  if ((error.stack ?? "").length > 0) {
    lines.push(`Stack: ${error.stack}`);
  }

  return lines.join("\n");
}
