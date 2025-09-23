/**
 * Test frame creation utilities
 */
import {
  createPhaseFrame,
  createGenerationFrame,
  createValidationFrame,
  createResultFrame,
  createErrorFrame,
} from "../streaming";

import type { StreamFrame, ValidationReport } from "../types";

/**
 * Create a sequence of frames for testing complete workflows
 */
export function createTestFrameSequence(): StreamFrame[] {
  return [
    createPhaseFrame("starting", 1, "Test phase"),
    createPhaseFrame("generating", 1, "Test generation"),
    createGenerationFrame("Hello ", "Hello ", 1),
    createGenerationFrame("world!", "Hello world!", 2),
    createPhaseFrame("validating", 1, "Test validation"),
    createValidationFrame(createMockValidationReport(true, []), 100),
    createPhaseFrame("completed", 1, "Test completed"),
    createResultFrame(true, "Hello world!", 1, 1000),
  ];
}

/**
 * Create error frame sequence for testing error scenarios
 */
export function createErrorFrameSequence(
  _errorMessage: string = "Test error",
  _recoverable: boolean = true
): StreamFrame[] {
  return [
    createPhaseFrame("error", 1, "Test error phase"),
    createErrorFrame("Test error message", true, "TEST_ERROR"),
  ];
}

/**
 * Create large frame data for performance testing
 */
export function createLargeFrame(size: number = 10000): StreamFrame {
  const largeContent = "A".repeat(size);
  return createGenerationFrame(largeContent, largeContent, size);
}

// Helper for mock validation report
function createMockValidationReport(
  ok: boolean = true,
  issues: any[] = []
): ValidationReport {
  return {
    ok,
    issues,
    coverage: {
      "test-item": true,
    },
  };
}
