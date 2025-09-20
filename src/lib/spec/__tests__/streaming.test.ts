/**
 * Basic tests for streaming protocol utilities
 */

import {
  createErrorFrame,
  createGenerationFrame,
  createPhaseFrame,
  encodeStreamFrame,
  StreamingError,
} from "../streaming";

import type { StreamFrame } from "../types";

/**
 * Frame Creation Tests
 */
describe("StreamFrame Creation", () => {
  test("createPhaseFrame should create valid phase frames", () => {
    const frame = createPhaseFrame("validating", 2, "Running validation");

    expect(frame.type).toBe("phase");

    if (frame.type === "phase") {
      expect(frame.data.phase).toBe("validating");
      expect(frame.data.attempt).toBe(2);
      expect(frame.data.message).toBe("Running validation");
      expect(typeof frame.data.timestamp).toBe("number");
    }
  });

  test("createGenerationFrame should create valid generation frames", () => {
    const frame = createGenerationFrame("Hello", "Hello World", 42);

    expect(frame.type).toBe("generation");

    if (frame.type === "generation") {
      expect(frame.data.delta).toBe("Hello");
      expect(frame.data.total).toBe("Hello World");
      expect(frame.data.tokenCount).toBe(42);
    }
  });

  test("createErrorFrame should create valid error frames", () => {
    const frame = createErrorFrame("Test error", false, "TEST_CODE", {
      extra: "data",
    });

    expect(frame.type).toBe("error");

    if (frame.type === "error") {
      expect(frame.data.message).toBe("Test error");
      expect(frame.data.recoverable).toBe(false);
      expect(frame.data.code).toBe("TEST_CODE");
      expect(frame.data.details).toEqual({ extra: "data" });
    }
  });
});

/**
 * Frame Encoding Tests
 */
describe("Frame Encoding", () => {
  test("encodeStreamFrame should create valid NDJSON", () => {
    const frame = createPhaseFrame("generating", 1, "Test");
    const encoded = encodeStreamFrame(frame);
    const decoded = new TextDecoder().decode(encoded);

    expect(decoded.endsWith("\n")).toBe(true);

    const parsed = JSON.parse(decoded.trim()) as StreamFrame;
    expect(parsed.type).toBe("phase");

    if (parsed.type === "phase") {
      expect(parsed.data.phase).toBe("generating");
    }
  });

  test("should handle multiple frames in sequence", () => {
    const frame1 = createPhaseFrame("generating", 1);
    const frame2 = createGenerationFrame("Hello", "Hello", 1);
    const frame3 = createErrorFrame("Test error");

    const encoded1 = new TextDecoder().decode(encodeStreamFrame(frame1));
    const encoded2 = new TextDecoder().decode(encodeStreamFrame(frame2));
    const encoded3 = new TextDecoder().decode(encodeStreamFrame(frame3));

    const combined = encoded1 + encoded2 + encoded3;
    const lines = combined.split("\n").filter((line) => line.trim());

    expect(lines).toHaveLength(3);

    const parsed1 = JSON.parse(lines[0]) as StreamFrame;
    const parsed2 = JSON.parse(lines[1]) as StreamFrame;
    const parsed3 = JSON.parse(lines[2]) as StreamFrame;

    expect(parsed1.type).toBe("phase");
    expect(parsed2.type).toBe("generation");
    expect(parsed3.type).toBe("error");
  });
});

/**
 * Error Handling Tests
 */
describe("Error Handling", () => {
  test("StreamingError should create proper error objects", () => {
    const error = new StreamingError("Test error", false, "TEST_CODE", {
      test: true,
    });

    expect(error.message).toBe("Test error");
    expect(error.recoverable).toBe(false);
    expect(error.code).toBe("TEST_CODE");
    expect(error.details).toEqual({ test: true });
    expect(error.name).toBe("StreamingError");
  });

  test("StreamingError.toStreamFrame should create valid error frame", () => {
    const error = new StreamingError("Test error", true, "TEST_CODE");
    const frame = error.toStreamFrame();

    expect(frame.type).toBe("error");

    if (frame.type === "error") {
      expect(frame.data.message).toBe("Test error");
      expect(frame.data.recoverable).toBe(true);
      expect(frame.data.code).toBe("TEST_CODE");
    }
  });
});

/**
 * Performance Tests
 */
describe("Performance", () => {
  test("should handle large frames efficiently", () => {
    const largeContent = "A".repeat(50000); // 50KB
    const frame = createGenerationFrame(largeContent, largeContent, 50000);

    expect(frame.type).toBe("generation");

    if (frame.type === "generation") {
      expect(frame.data.delta.length).toBe(50000);
    }

    // Test encoding performance
    const start = performance.now();
    const encoded = encodeStreamFrame(frame);
    const encodeTime = performance.now() - start;

    expect(encodeTime).toBeLessThan(1000); // Should complete in under 1 second
    expect(encoded.length).toBeGreaterThan(50000);
  });

  test("should handle rapid frame creation", () => {
    const start = performance.now();
    const frames: StreamFrame[] = [];

    // Create 1000 frames rapidly
    for (let i = 0; i < 1000; i++) {
      frames.push(createGenerationFrame(`token${i}`, `content${i}`, i));
    }

    const createTime = performance.now() - start;

    expect(frames).toHaveLength(1000);
    expect(createTime).toBeLessThan(1000); // Should complete quickly
    expect(frames[0].type).toBe("generation");
    expect(frames[999].type).toBe("generation");
  });
});

/**
 * Type Safety Tests
 */
describe("Type Safety", () => {
  test("frame types should be properly discriminated", () => {
    const frame: StreamFrame = createPhaseFrame("generating", 1);

    if (frame.type === "phase") {
      expect(frame.data.phase).toBe("generating");
      expect(frame.data.attempt).toBe(1);
      // TypeScript should ensure we can't access data.delta here
    }
  });

  test("different frame types should have different structures", () => {
    const phaseFrame = createPhaseFrame("generating", 1);
    const genFrame = createGenerationFrame("test", "test", 1);
    const errorFrame = createErrorFrame("test");

    expect(phaseFrame.type).toBe("phase");
    expect(genFrame.type).toBe("generation");
    expect(errorFrame.type).toBe("error");

    // Each should have different data structures
    if (phaseFrame.type === "phase") {
      expect("phase" in phaseFrame.data).toBe(true);
    }

    if (genFrame.type === "generation") {
      expect("delta" in genFrame.data).toBe(true);
    }

    if (errorFrame.type === "error") {
      expect("message" in errorFrame.data).toBe(true);
    }
  });
});
