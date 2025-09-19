/**
 * Common validation utility functions
 */

import { VALIDATION_THRESHOLDS } from "@/lib/constants";

import { PATTERNS } from "./constants";

import type { Issue } from "../types";

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
  // Extract metrics using pattern: - <metric>: <value> or * <metric>: <value>
  // Handles inline comments after # character
  const map = new Map<string, string>();
  const defaultPattern = /^[-*]\s+([^:]+):\s+([^#]+)(?:#.*)?$/;
  const metricRegex = params.metricRegex ?? "";
  const customPattern = metricRegex.length > 0 ? new RegExp(metricRegex) : null;

  for (const line of block.split("\n")) {
    if (customPattern) {
      // Use custom regex if provided
      const matches = line.match(customPattern);
      if (
        matches &&
        matches.length >= VALIDATION_THRESHOLDS.MIN_CAPTURE_GROUPS &&
        typeof matches[1] === "string" &&
        typeof matches[2] === "string"
      ) {
        const key = matches[1].trim().toLowerCase();
        const value = matches[2].trim();
        if (key && value) {
          map.set(key, value);
        }
      }
    } else {
      // Use default pattern
      const m = line.match(defaultPattern);
      if (m) map.set(m[1].trim().toLowerCase(), m[2].trim());
    }
  }
  return map;
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

/**
 * Helper to safely void unused parameters (reduces ESLint noise)
 */
export function voidUnused(..._args: unknown[]): void {
  // Intentionally empty - marks parameters as intentionally unused to satisfy linter
  void _args; // This reference satisfies the linter
}
