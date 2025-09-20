/**
 * @fileoverview Shared validation utilities and helpers
 */

import type { Issue } from "../types";
import { PATTERNS } from "./constants";

// Validation thresholds
export const VALIDATION_THRESHOLDS = {
  MIN_WORD_COUNT: 50,
  MAX_WORD_COUNT: 1800,
  MIN_SECTION_COUNT: 5,
  MAX_PLACEHOLDER_RATIO: 0.1,
  MIN_COMPETITIVE_ANALYSIS_WORDS: 100,
  MIN_CAPTURE_GROUPS: 3,
} as const;

/**
 * Extract section content using a regex pattern
 */
export function extractSection(draft: string, regex: RegExp): string {
  return draft.match(regex)?.[0] ?? "";
}

/**
 * Extract bullet points from a text block
 */
export function extractBulletPoints(block: string): string[] {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => PATTERNS.BULLET_ITEMS.test(line))
    .map((line) => line.replace(PATTERNS.BULLET_ITEMS, ""));
}

/**
 * Extract metrics from a text block using configurable patterns
 * Handles bullet point format: "- metric: value" and custom regex patterns
 */
export function extractMetrics(
  block: string,
  params: { metricRegex?: string }
): Map<string, string> {
  const map = new Map<string, string>();
  const lines = block.split("\n");
  const metricRegex = params.metricRegex ?? "";
  const customPattern = metricRegex.length > 0 ? new RegExp(metricRegex) : null;

  for (const line of lines) {
    const result = customPattern
      ? extractWithCustomPattern(line, customPattern)
      : extractWithDefaultPattern(line);

    if (result) {
      map.set(result.key, result.value);
    }
  }

  return map;
}

/**
 * Extract metric using custom regex pattern
 */
function extractWithCustomPattern(
  line: string,
  pattern: RegExp
): { key: string; value: string } | null {
  const matches = line.match(pattern);

  if (!matches || !isValidCustomMatch(matches)) {
    return null;
  }

  const key = matches[1].trim().toLowerCase();
  const value = matches[2].trim();

  return key && value ? { key, value } : null;
}

/**
 * Extract metric using default bullet point pattern
 */
function extractWithDefaultPattern(
  line: string
): { key: string; value: string } | null {
  const defaultPattern = /^[-*]\s+([^:]+):\s+([^#]+)(?:#.*)?$/;
  const match = line.match(defaultPattern);

  if (!match) return null;

  return {
    key: match[1].trim().toLowerCase(),
    value: match[2].trim(),
  };
}

/**
 * Validate custom regex match has required capture groups
 */
function isValidCustomMatch(matches: RegExpMatchArray): boolean {
  return (
    matches.length >= VALIDATION_THRESHOLDS.MIN_CAPTURE_GROUPS &&
    typeof matches[1] === "string" &&
    typeof matches[2] === "string"
  );
}

/**
 * Extract meaningful keywords from a feature name for better matching
 */
export function extractFeatureKeywords(featureName: string): string[] {
  // Remove common words and extract meaningful terms
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
  ]);
  return featureName
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, VALIDATION_THRESHOLDS.MIN_CAPTURE_GROUPS); // Take up to 3 most significant words
}

/**
 * Check if a metric references a feature using multiple matching strategies
 */
export function doesMetricReferenceFeature(
  metric: string,
  featureName: string
): boolean {
  const metricLower = metric.toLowerCase();
  const featureKeywords = extractFeatureKeywords(featureName);

  // Strategy 1: Check if any significant keyword from feature name appears in metric
  const keywordMatch = featureKeywords.some((keyword) =>
    metricLower.includes(keyword)
  );

  // Strategy 2: Check if first word of feature name appears (original logic as fallback)
  const firstWordMatch = metricLower.includes(
    featureName.toLowerCase().split(" ")[0]
  );

  return keywordMatch || firstWordMatch;
}

/**
 * Count sections in draft using header pattern
 */
export function countSections(draft: string, headerRegex: string): number {
  const regex = new RegExp(headerRegex, "gm");
  return (draft.match(regex) ?? []).length;
}

/**
 * Validate header pattern consistency
 */
export function validateHeaderPattern(
  draft: string,
  params: { pattern: string; headerRegex?: string },
  itemId: string
): Issue[] {
  const lines = draft.split("\n").filter(Boolean);
  const headerRegexStr = params.headerRegex ?? "";
  const headerRegex =
    headerRegexStr.length > 0
      ? new RegExp(headerRegexStr)
      : PATTERNS.NUMBERED_HEADER;
  const issues: Issue[] = [];

  for (const line of lines) {
    if (headerRegex.test(line)) {
      if (!PATTERNS.NUMBERED_HEADER.test(line)) {
        issues.push({
          id: "label-pattern-mismatch",
          itemId,
          severity: "error",
          message: `header not matching pattern: ${params.pattern}`,
          evidence: line,
        });
      }
    }
  }

  return issues;
}
