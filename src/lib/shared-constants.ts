/**
 * Shared constants across the application
 *
 * Consolidates common constants that were duplicated across multiple files
 * to eliminate parameter repetition and improve maintainability.
 */

// API Configuration
export const API_ENDPOINTS = {
  RUN: "/api/run",
  REFINE: "/api/refine",
} as const;

// Validation Limits
export const VALIDATION_LIMITS = {
  MIN_PROMPT_LENGTH: 10,
  MAX_WORD_COUNT: 1800,
  MIN_SECTION_COUNT: 5,
  MAX_ATTEMPTS: 3,
} as const;

// Common UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOOLTIP_DELAY: 500,
} as const;

// File Extensions and Types
export const FILE_EXTENSIONS = {
  TYPESCRIPT: [".ts", ".tsx"],
  JAVASCRIPT: [".js", ".jsx"],
  JSON: [".json"],
  MARKDOWN: [".md", ".mdx"],
} as const;

// Error Codes (consolidating from multiple files)
export const ERROR_CODES = {
  MISSING_API_KEY: "MISSING_API_KEY",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  TIMEOUT: "TIMEOUT",
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
