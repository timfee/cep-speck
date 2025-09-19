/**
 * Application-wide constants to avoid magic numbers in ESLint
 */

// Timeouts and delays (in milliseconds)
export const TIMEOUTS = {
  SHORT_DELAY: 2000,
  MEDIUM_DELAY: 5000,
  LONG_DELAY: 8000,
  VERY_LONG_DELAY: 10000,
  POLLING_INTERVAL: 150,
  DEBOUNCE_DELAY: 200,
  ANIMATION_DURATION: 36,
} as const;

// Retry attempts
export const RETRY_LIMITS = {
  DEFAULT_MAX_ATTEMPTS: 3,
  RESILIENT_RETRIES: 5,
  CRITICAL_RETRIES: 8,
  EXTENDED_RETRIES: 12,
} as const;

// Size limits and thresholds
export const SIZE_LIMITS = {
  BUFFER_SIZE: 1024,
  MAX_ITERATIONS: 50,
  PROGRESS_THRESHOLD: 80,
  HIGH_THRESHOLD: 200,
  TEXTAREA_LINES: 16,
  COMPACT_LINES: 10,
  EXPANDED_LINES: 30,
} as const;

// Timing constants (in seconds)
export const TIMING = {
  MINUTE_IN_SECONDS: 60,
} as const;

export default {
  TIMEOUTS,
  RETRY_LIMITS,
  SIZE_LIMITS,
  TIMING,
} as const;