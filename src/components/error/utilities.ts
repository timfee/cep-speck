/**
 * Consolidated error handling utilities
 * Combines common error handling patterns from multiple files
 */

import type { ErrorDetails } from "@/lib/error/types";

/**
 * Error recovery utilities
 */
export function isErrorRecoverable(error: ErrorDetails): boolean {
  return error.code !== "UNEXPECTED_ERROR" && error.code !== "MISSING_API_KEY";
}

export function formatErrorTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

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

/**
 * Error message utilities
 */
export function sanitizeErrorMessage(message: string): string {
  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed : "Operation failed";
}

export function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}

/**
 * Error context utilities
 */
export function createErrorContext(
  phase?: string,
  attempt?: number,
  maxAttempts?: number
) {
  return {
    timestamp: Date.now(),
    phase,
    attempt,
    maxAttempts,
  };
}
