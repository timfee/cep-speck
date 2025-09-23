/**
 * Test utilities for streaming protocol validation
 */
import type { ValidationReport, Issue } from "../types";

// Re-export focused utility modules
export {
  createTestFrameSequence,
  createErrorFrameSequence,
  createLargeFrame,
} from "./frame-creators";
export { parseNDJSONStream, validateFrameSequence } from "./validation-helpers";
export {
  simulateNetworkDelay,
  measureMemoryUsage,
} from "./performance-helpers";

/**
 * Mock validation report for testing
 */
export function createMockValidationReport(
  ok: boolean = true,
  issues: Issue[] = []
): ValidationReport {
  return {
    ok,
    issues,
    coverage: {
      "test-item": true,
    },
  };
}

/**
 * Mock issue for testing
 */
export function createMockIssue(
  id: string = "test-issue",
  severity: "error" | "warn" = "error"
): Issue {
  return {
    id,
    itemId: "test-item",
    severity,
    message: `Test ${severity} message`,
    evidence: "Test evidence",
    hints: ["Test hint 1", "Test hint 2"],
  };
}
