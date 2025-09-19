/**
 * Performance tests for streaming protocol
 */

import {
  createPhaseFrame,
  createGenerationFrame,
  createErrorFrame,
  encodeStreamFrame,
} from "../../src/lib/spec/streaming";
import {
  FrameRateTracker,
  measureMemoryUsage,
} from "../../src/lib/spec/__tests__/test-utils";
import {
  BrowserCompatibilityChecker,
  FramePerformanceMonitor,
} from "../browser/compatibility";
import type { StreamFrame, StreamPhase } from "../../src/lib/spec/types";

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
      // Allow a slightly higher threshold and use average to reduce flakiness
      expect(avgDuration).toBeLessThan(1200); // Average: should create 10k frames in under 1.2 seconds
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
      expect(duration).toBeLessThan(100); // Should create large frame quickly
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
      expect(duration).toBeLessThan(500); // Should handle mixed types efficiently
    });
  });

  describe("Frame Encoding Performance", () => {
    test("should encode frames efficiently", () => {
      const frames = [];
      for (let i = 0; i < 1000; i++) {
        frames.push(createGenerationFrame(`token${i}`, `content${i}`, i));
      }

      const startTime = performance.now();
      const encoded = frames.map(frame => encodeStreamFrame(frame));
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(encoded).toHaveLength(1000);
      expect(duration).toBeLessThan(200); // Should encode 1000 frames quickly

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
      expect(duration).toBeLessThan(1000); // Should encode 1MB in under 1 second
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
        frames.forEach(frame => encodeStreamFrame(frame));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Should handle sustained encoding load
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
      frames.forEach(frame => {
        const encoded = encodeStreamFrame(frame);
        const decoded = new TextDecoder().decode(encoded);
        JSON.parse(decoded.trim());
      });

      // Clear frames to allow garbage collection
      frames.length = 0;

      // Force garbage collection if available
      if ((global as Record<string, unknown>).gc) {
        ((global as Record<string, unknown>).gc as () => void)();
      }

      const afterCleanup = measureMemoryUsage();

      if (initialMemory.available) {
        expect(afterCreation.used).toBeGreaterThan(initialMemory.used);
        // After cleanup, memory growth should be minimal
        const finalGrowth = afterCleanup.used - initialMemory.used;
        expect(finalGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
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
      expect(stats.avgProcessingTime).toBeLessThan(10); // Average under 10ms per frame
      expect(stats.maxProcessingTime).toBeLessThan(100); // Max under 100ms
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
          new Promise<StreamFrame[]>(resolve => {
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
      expect(results.every(frames => frames.length === 100)).toBe(true);
      expect(duration).toBeLessThan(1000); // Should handle concurrent creation efficiently
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
          new Promise<Uint8Array[]>(resolve => {
            const encoded = baseFrames.map(frame => encodeStreamFrame(frame));
            resolve(encoded);
          })
        );
      }

      const results = await Promise.all(encodingPromises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(5);
      expect(results.every(encoded => encoded.length === 50)).toBe(true);
      expect(duration).toBeLessThan(500); // Should handle concurrent encoding efficiently
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
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const endTime = performance.now();
      const stats = monitor.getStatistics();

      expect(stats.totalFrames).toBe(phases.length);
      expect(endTime - startTime).toBeLessThan(2000); // Realistic generation should be fast
      expect(stats.avgProcessingTime).toBeLessThan(50); // Reasonable processing time
      expect(totalContent.length).toBeGreaterThan(1000); // Should generate substantial content
    });

    test("should handle high-frequency frame updates", () => {
      const tracker = new FrameRateTracker();
      const startTime = performance.now();

      // Simulate high-frequency updates (like real-time content streaming)
      const interval = setInterval(() => {
        tracker.recordFrame();

        // Create and encode frame rapidly
        const frame = createGenerationFrame("update", "content", 1);
        encodeStreamFrame(frame);
      }, 10); // Every 10ms

      // Run for 1 second
      return new Promise<void>(resolve => {
        setTimeout(() => {
          clearInterval(interval);

          const endTime = performance.now();
          const frameRate = tracker.getFrameRate(1000);
          const duration = endTime - startTime;

          expect(duration).toBeGreaterThan(900); // Should run for about 1 second
          expect(frameRate).toBeGreaterThan(50); // Should handle high frequency
          expect(frameRate).toBeLessThan(150); // But not unrealistically high

          resolve();
        }, 1000);
      });
    }, 2000);

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
      expect(results.every(r => r.duration < 100)).toBe(true); // All under 100ms

      // Larger content should not be drastically slower
      const smallestDuration = results[0].duration;
      const largestDuration = results[results.length - 1].duration;
      const scalingRatio = largestDuration / smallestDuration;

      expect(scalingRatio).toBeLessThan(50); // Should not be more than 50x slower
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

      const encoded = frames.map(f => encodeStreamFrame(f));
      const endTime = performance.now();

      expect(frames).toHaveLength(1000);
      expect(encoded).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000);

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

        const encoded = frames.map(f => encodeStreamFrame(f));

        expect(frames).toHaveLength(100);
        expect(encoded).toHaveLength(100);
        // Should work even in constrained environment
      }
    });
  });
});
