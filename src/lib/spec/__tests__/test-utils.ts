/**
 * Test utilities for streaming protocol validation
 */
import { 
  createPhaseFrame, 
  createGenerationFrame, 
  createValidationFrame, 
  createResultFrame, 
  createErrorFrame 
} from "../streaming";

import type { StreamFrame, ValidationReport, Issue } from "../types";

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

/**
 * Parse NDJSON stream data for testing
 */
export function parseNDJSONStream(data: string): StreamFrame[] {
  const frames: StreamFrame[] = [];
  const lines = data.split("\n");
  
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const frame = JSON.parse(line) as StreamFrame;
      frames.push(frame);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Failed to parse frame:", line, message);
    }
  }
  
  return frames;
}

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
 * Simulate network delays for testing
 */
export function simulateNetworkDelay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create large frame data for performance testing
 */
export function createLargeFrame(size: number = 10000): StreamFrame {
  const largeContent = "A".repeat(size);
  return createGenerationFrame(largeContent, largeContent, size);
}

/**
 * Validate frame sequence follows expected pattern
 */
export function validateFrameSequence(
  frames: StreamFrame[],
  expectedPattern: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const actualPattern = frames.map((f) => f.type);
  
  if (actualPattern.length !== expectedPattern.length) {
    errors.push(
      `Length mismatch: expected ${expectedPattern.length}, got ${actualPattern.length}`
    );
  }
  
  for (let i = 0; i < Math.min(actualPattern.length, expectedPattern.length); i++) {
    if (actualPattern[i] !== expectedPattern[i]) {
      errors.push(
        `Frame ${i}: expected ${expectedPattern[i]}, got ${actualPattern[i]}`
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Memory usage helper for performance testing
 */
export function measureMemoryUsage(): {
  used: number;
  total: number;
  available: boolean;
} {
  if (typeof process !== "undefined" && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      used: usage.heapUsed,
      total: usage.heapTotal,
      available: true,
    };
  }
  
  // Browser environment fallback
  if (typeof performance !== "undefined" && (performance as unknown as Record<string, unknown>).memory) {
    const memory = (performance as unknown as Record<string, unknown>).memory as {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
    };
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      available: true,
    };
  }
  
  return {
    used: 0,
    total: 0,
    available: false,
  };
}

/**
 * Frame rate calculation for performance testing
 */
export class FrameRateTracker {
  private frames: number[] = [];
  
  recordFrame(): void {
    this.frames.push(Date.now());
  }
  
  getFrameRate(windowMs: number = 1000): number {
    const now = Date.now();
    const cutoff = now - windowMs;
    this.frames = this.frames.filter((time) => time > cutoff);
    return this.frames.length;
  }
  
  reset(): void {
    this.frames = [];
  }
}