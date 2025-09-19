/**
 * Test utilities for streaming protocol validation
 */
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
    } catch (error) {
      console.warn("Failed to parse frame:", line, error);
    }
  }

  return frames;
}

/**
 * Create a sequence of frames for testing complete workflows
 */
export function createTestFrameSequence(): StreamFrame[] {
  return [
    {
      type: "phase",
      data: {
        phase: "loading-knowledge",
        attempt: 1,
        timestamp: Date.now(),
        message: "Loading knowledge base",
      },
    },
    {
      type: "phase",
      data: {
        phase: "generating",
        attempt: 1,
        timestamp: Date.now(),
        message: "Generating content",
      },
    },
    {
      type: "generation",
      data: {
        delta: "Hello ",
        total: "Hello ",
        tokenCount: 1,
      },
    },
    {
      type: "generation",
      data: {
        delta: "world!",
        total: "Hello world!",
        tokenCount: 2,
      },
    },
    {
      type: "phase",
      data: {
        phase: "validating",
        attempt: 1,
        timestamp: Date.now(),
        message: "Running validation checks",
      },
    },
    {
      type: "validation",
      data: {
        report: createMockValidationReport(true, []),
        duration: 100,
      },
    },
    {
      type: "phase",
      data: {
        phase: "done",
        attempt: 1,
        timestamp: Date.now(),
        message: "Content generation complete",
      },
    },
    {
      type: "result",
      data: {
        success: true,
        finalDraft: "Hello world!",
        totalAttempts: 1,
        totalDuration: 1000,
      },
    },
  ];
}

/**
 * Create error frame sequence for testing error scenarios
 */
export function createErrorFrameSequence(
  errorMessage: string = "Test error",
  recoverable: boolean = true
): StreamFrame[] {
  return [
    {
      type: "phase",
      data: {
        phase: "generating",
        attempt: 1,
        timestamp: Date.now(),
        message: "Generating content",
      },
    },
    {
      type: "error",
      data: {
        message: errorMessage,
        recoverable,
        code: "TEST_ERROR",
        details: { testData: true },
      },
    },
  ];
}

/**
 * Simulate network delays for testing
 */
export function simulateNetworkDelay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create large frame data for performance testing
 */
export function createLargeFrame(size: number = 10000): StreamFrame {
  const largeContent = "A".repeat(size);
  return {
    type: "generation",
    data: {
      delta: largeContent,
      total: largeContent,
      tokenCount: size,
    },
  };
}

/**
 * Validate frame sequence follows expected pattern
 */
export function validateFrameSequence(
  frames: StreamFrame[],
  expectedPattern: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const actualPattern = frames.map(f => f.type);

  if (actualPattern.length !== expectedPattern.length) {
    errors.push(
      `Length mismatch: expected ${expectedPattern.length}, got ${actualPattern.length}`
    );
  }

  for (
    let i = 0;
    i < Math.min(actualPattern.length, expectedPattern.length);
    i++
  ) {
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
  if (
    typeof performance !== "undefined" &&
    (performance as unknown as Record<string, unknown>).memory
  ) {
    const memory = (performance as unknown as Record<string, unknown>)
      .memory as {
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
    this.frames = this.frames.filter(time => time > cutoff);
    return this.frames.length;
  }

  reset(): void {
    this.frames = [];
  }
}
