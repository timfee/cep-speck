import type { ErrorClassification } from "./types";

/**
 * Error pattern matchers for classification
 */
interface ErrorMatcher {
  test: (error: { message: string; code?: string }) => boolean;
  classification: ErrorClassification;
}

/**
 * Predefined error matchers for common error patterns
 */
export const ERROR_MATCHERS: ErrorMatcher[] = [
  {
    test: (error) =>
      error.code === "MISSING_API_KEY" ||
      error.message.includes("Missing GOOGLE_GENERATIVE_AI_API_KEY"),
    classification: {
      code: "MISSING_API_KEY",
      severity: "critical",
      title: "API Key Missing",
      message:
        "API key is missing. Please add your Google AI API key to continue.",
      recoverable: false,
      actions: [
        "Add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables",
      ],
      status: "offline",
    },
  },
  {
    test: (error) =>
      error.code === "NETWORK_TIMEOUT" ||
      error.message.includes("timeout") ||
      error.message.includes("network"),
    classification: {
      code: "NETWORK_TIMEOUT",
      severity: "warning",
      title: "Network Issue",
      message:
        "Network connection issue. Please check your internet connection.",
      recoverable: true,
      actions: ["Check internet connection and try again"],
      status: "degraded",
    },
  },
  {
    test: (error) =>
      error.code === "RATE_LIMITED" ||
      error.message.includes("rate limit") ||
      error.message.includes("too many requests"),
    classification: {
      code: "RATE_LIMITED",
      severity: "warning",
      title: "Rate Limited",
      message: "Too many requests. Please wait a moment before trying again.",
      recoverable: true,
      actions: ["Wait 30 seconds and retry"],
      status: "degraded",
    },
  },
  {
    test: (error) =>
      error.code === "VALIDATION_FAILED" ||
      error.message.includes("validation"),
    classification: {
      code: "VALIDATION_FAILED",
      severity: "warning",
      title: "Validation Failed",
      message: "Input validation failed. Please check your request.",
      recoverable: false,
      actions: ["Review input and correct any errors"],
      status: "degraded",
    },
  },
  {
    test: (error) =>
      error.code === "SERVICE_UNAVAILABLE" ||
      error.message.includes("unavailable") ||
      error.message.includes("service"),
    classification: {
      code: "SERVICE_UNAVAILABLE",
      severity: "critical",
      title: "Service Unavailable",
      message: "Service is temporarily unavailable. Please try again later.",
      recoverable: true,
      actions: ["Wait and retry in a few minutes"],
      status: "offline",
    },
  },
  {
    test: (error) =>
      error.code === "INVALID_INPUT" ||
      error.message.includes("invalid") ||
      error.message.includes("malformed"),
    classification: {
      code: "INVALID_INPUT",
      severity: "info",
      title: "Invalid Input",
      message: "Invalid input provided. Please check your data.",
      recoverable: false,
      actions: ["Verify input format and try again"],
      status: "degraded",
    },
  },
];

/**
 * Default classification for unexpected errors
 */
export const DEFAULT_ERROR_CLASSIFICATION: ErrorClassification = {
  code: "UNEXPECTED_ERROR",
  severity: "critical",
  title: "Unexpected Error",
  message: "An unexpected error occurred. Please try again.",
  recoverable: false,
  actions: ["If the issue persists, contact support"],
  status: "offline",
};

/**
 * Find the appropriate error classification using matchers
 */
export function findErrorClassification(error: {
  message: string;
  code?: string;
}): ErrorClassification {
  for (const matcher of ERROR_MATCHERS) {
    if (matcher.test(error)) {
      return matcher.classification;
    }
  }
  return DEFAULT_ERROR_CLASSIFICATION;
}
