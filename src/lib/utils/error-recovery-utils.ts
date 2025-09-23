/**
 * Error recovery utilities
 */

import type { ErrorDetails } from "@/lib/error/types";

/**
 * Check if an error is recoverable
 */
export function isErrorRecoverable(error: ErrorDetails): boolean {
  return error.code !== "UNEXPECTED_ERROR" && error.code !== "MISSING_API_KEY";
}

/**
 * Format error timestamp for display
 */
export function formatErrorTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Check if context has valid attempt information
 */
export function hasValidAttemptInfo(context?: {
  attempt?: number;
  maxAttempts?: number;
}): boolean {
  return (
    context?.attempt !== undefined &&
    context.maxAttempts !== undefined &&
    context.attempt > 0 &&
    context.maxAttempts > 0
  );
}