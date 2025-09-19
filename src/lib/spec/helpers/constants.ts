/**
 * Shared constants and regex patterns used across validation modules
 */

// Common regex patterns for validation
export const PATTERNS = {
  // Header patterns
  NUMBERED_HEADER: /^#\s+\d+\./,
  HEADER_WITH_PATTERN: (pattern: string) =>
    new RegExp(`^#\\s+\\d+\\.\\s+${pattern}`, "gm"),

  // Metric patterns
  METRIC_KEYWORDS: /(baseline|target|metric)/i,
  UNIT_KEYWORDS: /(minutes|hours|days|%|count|users)/i,
  METRIC_UNITS: /%|\bms\b|\bminutes?\b|\bdays?\b|\bcount\b/,
  TIMEFRAME_INDICATORS: /\b(within|by)\b/i,
  SOURCE_OF_TRUTH:
    /\b(SoT|Source of Truth|CBCM|Reporting Connector|Admin Console)\b/,

  // Content quality patterns
  VAGUE_QUANTIFIERS:
    /\b(some|many|several|few|most|often|rarely|occasionally)\b/gi,
  HEDGING_LANGUAGE:
    /\b(might|could|should|would|possibly|perhaps|maybe|likely)\b/gi,
  OVER_EXPLANATION: [
    /\b(as mentioned|as stated|as discussed|as noted|it should be noted|it is important to note|it is worth noting)\b/gi,
    /\b(this is because|the reason for this|in order to|for the purpose of)\b/gi,
  ],

  // Placeholder patterns
  PLACEHOLDER: /\[PM_INPUT_NEEDED:[^\]]+\]/g,
  PLACEHOLDER_CONTENT: /\[PM_INPUT_NEEDED:\s*([^\]]+)\]/,

  // Section extraction patterns
  TLDR_SECTION: /# 1\. TL;DR[\s\S]*?(?=# \d+\.|$)/,
  SUCCESS_METRICS_SECTION: /# 8\. Success Metrics[\s\S]*?(?=# \d+\.|$)/,
  PEOPLE_PROBLEMS_SECTION: /# 2\. People Problems[\s\S]*?(?=# 3\.|$)/,
  GOALS_SECTION: /# 4\. Goals[\s\S]*?(?=# 5\.|$)/,
  CUJS_SECTION: /# 5\. CUJs[\s\S]*?(?=# 6\.|$)/,

  // List item patterns
  BULLET_ITEMS: /^[-*]\s+/,
} as const;

// Common validation thresholds and limits
export const LIMITS = {
  PLACEHOLDER_MIN_WORDS: 3,
  DEFAULT_WORD_BUDGET: 1800,
  MIN_SECTION_COUNT: 8,
  MAX_SECTION_COUNT: 12,
} as const;

// Common messaging templates
export const MESSAGES = {
  MISSING_UNITS: "missing units",
  MISSING_TIMEFRAME: "missing timeframe",
  MISSING_SOT: "missing SoT",
  VAGUE_PLACEHOLDER: "Placeholder too vague",
  PATTERN_MISMATCH: "header not matching pattern",
  SECTION_COUNT_MISMATCH: "section count mismatch",
} as const;
