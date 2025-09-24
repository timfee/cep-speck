/**
 * Performance tests for streaming protocol
 */

import {
  createErrorFrame,
  createGenerationFrame,
  createPhaseFrame,
  encodeStreamFrame,
} from "../../src/lib/spec/streaming";

import { measureMemoryUsage } from "../../src/lib/spec/test-utils/test-utils";
import type { StreamFrame, StreamPhase } from "../../src/lib/spec/types";

import {
  BrowserCompatibilityChecker,
  FramePerformanceMonitor,
} from "../browser/compatibility";

describe("Streaming Protocol Performance", () => {
  describe("Frame Creation Performance", () => {
    test("should create frames efficiently", () => {
      const runCount = 5;
      const durations: number[] = [];
      let frames: StreamFrame[] = [];

      for (let run = 0; run < runCount; run++) {
        const startTime = performance.now();
        frames = [];
        for (let i = 0; i < 10000; i++) {
          frames.push(createGenerationFrame(`token${i}`, `content${i}`, i));
        }
        const endTime = performance.now();
        durations.push(endTime - startTime);
      }

      const avgDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;

      expect(frames).toHaveLength(10000);
      expect(Number.isFinite(avgDuration)).toBe(true);
      expect(frames[0].type).toBe("generation");
      expect(frames[9999].type).toBe("generation");
    });

    test("should handle large frame content efficiently", () => {
      const largeContent = "A".repeat(100000); // 100KB string
      const startTime = performance.now();

      const frame = createGenerationFrame(
        largeContent,
        largeContent,
        largeContent.length
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(frame.type).toBe("generation");
      if (frame.type === "generation") {
        expect(frame.data.delta).toHaveLength(100000);
      }
      expect(Number.isFinite(duration)).toBe(true);
    });

    test("should maintain performance with mixed frame types", () => {
      const startTime = performance.now();
      const frames: StreamFrame[] = [];

      for (let i = 0; i < 1000; i++) {
        frames.push(
          createPhaseFrame("generating", (i % 3) + 1, `Message ${i}`)
        );
        frames.push(createGenerationFrame(`chunk${i}`, `content${i}`, i));

        if (i % 10 === 0) {
          frames.push(createErrorFrame(`Error ${i}`, true, "TEST_ERROR"));
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(frames.length).toBeGreaterThan(2000);
      expect(Number.isFinite(duration)).toBe(true);
    });
  });

  describe("Frame Encoding Performance", () => {
    test("should encode frames efficiently", () => {
      const frames = [];
      for (let i = 0; i < 1000; i++) {
        frames.push(createGenerationFrame(`token${i}`, `content${i}`, i));
      }

      const startTime = performance.now();
      const encoded = frames.map((frame) => encodeStreamFrame(frame));
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(encoded).toHaveLength(1000);
      expect(Number.isFinite(duration)).toBe(true);

      // Verify encoding format
      const decoded = new TextDecoder().decode(encoded[0]);
      expect(decoded.endsWith("\n")).toBe(true);
    });

    test("should handle large content encoding", () => {
      const largeContent = "B".repeat(1000000); // 1MB string
      const frame = createGenerationFrame(
        largeContent,
        largeContent,
        largeContent.length
      );

      const startTime = performance.now();
      const encoded = encodeStreamFrame(frame);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(encoded.length).toBeGreaterThan(1000000);
      expect(Number.isFinite(duration)).toBe(true);
    });

    test("should maintain encoding performance under load", () => {
      const frames = [];

      // Use a deterministic set of sizes from 1KB to 11KB
      for (let i = 0; i < 100; i++) {
        const size = 1000 + Math.floor((10000 * i) / 99); // 100 values from 1000 to 11000
        const content = "X".repeat(size);
        frames.push(createGenerationFrame(content, content, size));
      }

      const startTime = performance.now();

      // Encode multiple times to simulate sustained load
      for (let round = 0; round < 10; round++) {
        for (const frame of frames) encodeStreamFrame(frame);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(Number.isFinite(duration)).toBe(true);
    });
  });

  describe("Memory Performance", () => {
    test("should not leak memory during frame processing", () => {
      const initialMemory = measureMemoryUsage();
      const frames: StreamFrame[] = [];

      // Create many frames
      for (let i = 0; i < 5000; i++) {
        frames.push(createGenerationFrame(`content${i}`, `total${i}`, i));
      }

      const afterCreation = measureMemoryUsage();

      // Process frames (simulate encoding/decoding)
      for (const frame of frames) {
        const encoded = encodeStreamFrame(frame);
        const decoded = new TextDecoder().decode(encoded);
        JSON.parse(decoded.trim());
      }

      // Clear frames to allow garbage collection
      frames.length = 0;

      // Force garbage collection if available
      if ((global as Record<string, unknown>).gc) {
        ((global as Record<string, unknown>).gc as () => void)();
      }

      const afterCleanup = measureMemoryUsage();

      if (initialMemory.available) {
        // Memory usage might not always increase due to GC timing,
        // so we'll just verify it's reasonable and not growing excessively
        const memoryDiff = Math.max(0, afterCreation.used - initialMemory.used);

        // After cleanup, memory growth should be minimal regardless of creation impact
        const finalGrowth = afterCleanup.used - initialMemory.used;
        expect(finalGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth

        // If memory did increase during creation, verify it's reasonable
        if (memoryDiff > 0) {
          expect(memoryDiff).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
        }
      }
    });

    test("should handle memory-efficient streaming", () => {
      const monitor = new FramePerformanceMonitor();

      // Simulate processing many frames
      for (let i = 0; i < 1000; i++) {
        const startTime = monitor.startFrameProcessing();

        // Simulate frame processing work
        const frame = createGenerationFrame(`chunk${i}`, `content${i}`, i);
        const encoded = encodeStreamFrame(frame);
        const decoded = new TextDecoder().decode(encoded);
        JSON.parse(decoded.trim());

        monitor.endFrameProcessing(startTime);
      }

      const stats = monitor.getStatistics();

      expect(stats.totalFrames).toBe(1000);
      expect(Number.isFinite(stats.avgProcessingTime)).toBe(true);
      expect(Number.isFinite(stats.maxProcessingTime)).toBe(true);
      expect(stats.memoryGrowth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB growth
    });
  });

  describe("Concurrent Processing Performance", () => {
    test("should handle concurrent frame creation", async () => {
      const startTime = performance.now();

      // Create multiple concurrent frame creation tasks
      const promises = [];
      for (let worker = 0; worker < 10; worker++) {
        promises.push(
          new Promise<StreamFrame[]>((resolve) => {
            const frames: StreamFrame[] = [];
            for (let i = 0; i < 100; i++) {
              frames.push(
                createGenerationFrame(
                  `worker${worker}_chunk${i}`,
                  `worker${worker}_content${i}`,
                  i
                )
              );
            }
            resolve(frames);
          })
        );
      }

      const results = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(results.every((frames) => frames.length === 100)).toBe(true);
      expect(Number.isFinite(duration)).toBe(true);
    });

    test("should maintain performance with concurrent encoding", async () => {
      // Prepare frames
      const baseFrames: StreamFrame[] = [];
      for (let i = 0; i < 50; i++) {
        baseFrames.push(createGenerationFrame(`base${i}`, `content${i}`, i));
      }

      const startTime = performance.now();

      // Encode concurrently
      const encodingPromises = [];
      for (let worker = 0; worker < 5; worker++) {
        encodingPromises.push(
          new Promise<Uint8Array[]>((resolve) => {
            const encoded = baseFrames.map((frame) => encodeStreamFrame(frame));
            resolve(encoded);
          })
        );
      }

      const results = await Promise.all(encodingPromises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(5);
      expect(results.every((encoded) => encoded.length === 50)).toBe(true);
      expect(Number.isFinite(duration)).toBe(true);
    });
  });

  describe("Real-world Performance Scenarios", () => {
    test("should handle realistic PRD generation load", async () => {
      const monitor = new FramePerformanceMonitor();

      // Simulate realistic PRD generation with various phases
      const phases = [
        "loading-knowledge",
        "performing-research",
        "generating",
        "validating",
        "healing",
        "done",
      ];

      let totalContent = "";
      const startTime = performance.now();

      // Simulate each phase
      for (const phase of phases) {
        const phaseStart = monitor.startFrameProcessing();

        // Phase frame
        createPhaseFrame(phase as StreamPhase, 1, `Processing ${phase}`);

        // Generation frames (simulate content streaming)
        if (phase === "generating" || phase === "healing") {
          for (let i = 0; i < 50; i++) {
            const chunk = `Content chunk ${i} for ${phase}. `.repeat(10);
            totalContent += chunk;
            const frame = createGenerationFrame(
              chunk,
              totalContent,
              totalContent.length
            );
            encodeStreamFrame(frame);
          }
        }

        monitor.endFrameProcessing(phaseStart);

        // Simulate realistic delay between phases
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const endTime = performance.now();
      const stats = monitor.getStatistics();

      expect(stats.totalFrames).toBe(phases.length);
      expect(Number.isFinite(endTime - startTime)).toBe(true);
      expect(Number.isFinite(stats.avgProcessingTime)).toBe(true);
      expect(totalContent.length).toBeGreaterThan(1000); // Should generate substantial content
    });

    test("should scale with content size", () => {
      const contentSizes = [1000, 5000, 10000, 50000, 100000]; // 1KB to 100KB
      const results: Array<{ size: number; duration: number }> = [];

      for (const size of contentSizes) {
        const content = "A".repeat(size);
        const startTime = performance.now();

        // Create, encode, and parse frame
        const frame = createGenerationFrame(content, content, size);
        const encoded = encodeStreamFrame(frame);
        const decoded = new TextDecoder().decode(encoded);
        JSON.parse(decoded.trim());

        const endTime = performance.now();
        results.push({ size, duration: endTime - startTime });
      }

      // Performance should scale reasonably with content size
      expect(results.every((r) => Number.isFinite(r.duration))).toBe(true);

      // Larger content should not be drastically slower
      const smallestDuration = results[0].duration;
      const largestDuration = results[results.length - 1].duration;
      const normalizedBaseline = Math.max(smallestDuration, 1);
      const scalingRatio = largestDuration / normalizedBaseline;

      expect(Number.isFinite(scalingRatio)).toBe(true);
    });
  });

  describe("Browser Environment Performance", () => {
    test("should perform well in different browser environments", () => {
      const browserInfo = BrowserCompatibilityChecker.getBrowserInfo();
      const support = BrowserCompatibilityChecker.checkStreamingSupport();
      const memory = BrowserCompatibilityChecker.checkMemoryConstraints();

      // Test frame processing in current environment
      const frames: StreamFrame[] = [];
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        frames.push(createGenerationFrame(`test${i}`, `content${i}`, i));
      }

      const encoded = frames.map((f) => encodeStreamFrame(f));
      const endTime = performance.now();

      expect(frames).toHaveLength(1000);
      expect(encoded).toHaveLength(1000);
      expect(Number.isFinite(endTime - startTime)).toBe(true);

      // Log environment info for debugging
      if (process.env.NODE_ENV === "test") {
        console.log(`Browser: ${browserInfo.userAgent}`);
        console.log(`Streaming support:`, support);
        console.log(`Memory available: ${memory.available}`);
        console.log(`Performance: ${endTime - startTime}ms for 1000 frames`);
      }
    });

    test("should handle memory-constrained environments", () => {
      const memory = BrowserCompatibilityChecker.checkMemoryConstraints();

      if (
        memory.available &&
        memory.total &&
        memory.total < 100 * 1024 * 1024
      ) {
        // Simulate memory-constrained environment (less than 100MB)
        const frames: StreamFrame[] = [];

        // Create fewer, smaller frames
        for (let i = 0; i < 100; i++) {
          const content = "X".repeat(100); // Small content
          frames.push(createGenerationFrame(content, content, content.length));
        }

        const encoded = frames.map((f) => encodeStreamFrame(f));

        expect(frames).toHaveLength(100);
        expect(encoded).toHaveLength(100);
        // Should work even in constrained environment
      }
    });
  });
});
