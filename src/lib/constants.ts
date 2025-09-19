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

// Validation thresholds
export const VALIDATION_THRESHOLDS = {
  MIN_WORD_COUNT: 25,
  MAX_WORD_COUNT: 25,
  MIN_LINE_COUNT: 15,
  MAX_LINE_COUNT: 15,
} as const;

// UI Component Constants
export const UI_CONSTANTS = {
  // Animation values
  ANIMATION_SCALE_SMALL: 0.4,
  ANIMATION_SCALE_MEDIUM: 1.1,
  ANIMATION_SCALE_LARGE: 1.5,
  ANIMATION_SCALE_PULSE: 1.02,
  ANIMATION_SCALE_BREATHE: 1.2,
  ANIMATION_OPACITY: 0.1,
  ANIMATION_OPACITY_MEDIUM: 0.2,
  
  // Percentages and scores
  SCORE_EXCELLENT: 90,
  SCORE_GOOD: 70,
  SCORE_FAIR: 50,
  THRESHOLD_LOW: 40,
  THRESHOLD_HIGH: 85,
  
  // Sizes and dimensions  
  ICON_SIZE: 4,
  BORDER_RADIUS: 36,
  
  // Number bases and formatting
  HEX_RADIX: 36,
  
  // Timing
  DISPLAY_DELAY: 30,
} as const;

// Timing constants (in seconds)
export const TIMING = {
  MINUTE_IN_SECONDS: 60,
} as const;

export default {
  TIMEOUTS,
  RETRY_LIMITS,
  SIZE_LIMITS,
  VALIDATION_THRESHOLDS,
  UI_CONSTANTS,
  TIMING,
} as const;