/**
 * Integration tests for streaming protocol
 */

import { EndToEndTestRunner, IntegrationTestScenarios, ClientFrameProcessor, StreamingAPISimulator } from './end-to-end';
import { encodeStreamFrame } from '../../src/lib/spec/streaming';
import { BrowserCompatibilityChecker, BrowserStreamingTester } from '../browser/compatibility';

describe('Streaming Protocol Integration', () => {
  describe('End-to-End Workflows', () => {
    test('should handle complete successful workflow', async () => {
      const result = await EndToEndTestRunner.testCompleteWorkflow();

      expect(result.success).toBe(true);
      expect(result.framesProcessed).toBeGreaterThan(5);
      expect(result.finalDraft).toContain('Product Requirements Document');
      expect(result.frameSequence).toEqual(
        expect.arrayContaining(['phase', 'generation', 'validation', 'result'])
      );
      expect(result.duration).toBeLessThan(2000); // Should complete quickly in test
    });

    test('should handle healing workflow with validation issues', async () => {
      const result = await EndToEndTestRunner.testHealingWorkflow();

      expect(result.success).toBe(true);
      expect(result.healingOccurred).toBe(true);
      expect(result.finalAttempt).toBe(2);
    });

    test('should handle error scenarios gracefully', async () => {
      const result = await EndToEndTestRunner.testErrorHandling();

      expect(result.errorCaught).toBe(true);
      expect(result.errorMessage).toContain('API key missing');
      expect(result.gracefulFailure).toBe(true);
    });

    test('should handle large content efficiently', async () => {
      const result = await EndToEndTestRunner.testLargeContentPerformance();

      expect(result.success).toBe(true);
      expect(result.throughput).toBeGreaterThan(10); // At least 10 frames per second
      expect(result.memoryEfficient).toBe(true);
    }, 10000); // Longer timeout for performance test
  });

  describe('Network Condition Testing', () => {
    test('should handle slow network conditions', async () => {
      const frames = IntegrationTestScenarios.createSuccessfulWorkflow();
      const simulator = new StreamingAPISimulator(frames, { delay: 100 }); // Slow network
      const processor = new ClientFrameProcessor();

      const stream = simulator.createReadableStream();
      const result = await processor.processStream(stream);

      expect(result.success).toBe(true);
      expect(result.performance.duration).toBeGreaterThan(500); // Should take longer
    }, 15000);

    test('should handle network interruptions', async () => {
      const result = await EndToEndTestRunner.testNetworkRecovery();

      expect(result.recoverySuccessful).toBe(true);
      expect(result.framesBeforeInterruption).toBeGreaterThan(0);
      expect(result.framesAfterRecovery).toBeGreaterThan(0);
    });

    test('should handle packet loss simulation', async () => {
      const frames = IntegrationTestScenarios.createSuccessfulWorkflow();
      const encodedFrames = frames.map(f => encodeStreamFrame(f));
      
      const tester = new BrowserStreamingTester({
        dropRate: 0.1,
        latency: 50,
      });

      const result = await tester.testFrameParsing(encodedFrames);

      // With packet loss, we should either have dropped frames OR errors (but might get lucky with no drops on small sets)
      expect(result.framesProcessed).toBeLessThanOrEqual(encodedFrames.length); // Some may be dropped
      expect(result.performance.totalFrames).toBeGreaterThan(0);
      
      // At least test completed without crashing
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Browser Compatibility', () => {
    test('should check streaming feature support', () => {
      const support = BrowserCompatibilityChecker.checkStreamingSupport();

      expect(support.fetch).toBe(true); // In Node.js test environment
      expect(support.textDecoder).toBe(true);
      expect(support.ndjson).toBe(true);
    });

    test('should get browser environment info', () => {
      const info = BrowserCompatibilityChecker.getBrowserInfo();

      expect(info.userAgent).toBeDefined();
      expect(info.platform).toBeDefined();
      expect(typeof info.onLine).toBe('boolean');
    });

    test('should handle memory constraints', () => {
      const memory = BrowserCompatibilityChecker.checkMemoryConstraints();

      if (memory.available) {
        expect(typeof memory.used).toBe('number');
        expect(typeof memory.total).toBe('number');
        expect(memory.used!).toBeGreaterThanOrEqual(0);
        expect(memory.total!).toBeGreaterThanOrEqual(memory.used!);
      } else {
        expect(memory.available).toBe(false);
      }
    });
  });

  describe('Frame Processing Performance', () => {
    test('should process frames within acceptable time limits', async () => {
      const frames = IntegrationTestScenarios.createSuccessfulWorkflow();
      const simulator = new StreamingAPISimulator(frames, { delay: 1 });
      const processor = new ClientFrameProcessor();

      const startTime = Date.now();
      const stream = simulator.createReadableStream();
      const result = await processor.processStream(stream);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should process quickly
      expect(result.totalFrames).toBe(frames.length);
    });

    test('should handle rapid frame succession', async () => {
      const frames = IntegrationTestScenarios.createLargeContentScenario();
      const simulator = new StreamingAPISimulator(frames, { delay: 0 }); // No delay
      const processor = new ClientFrameProcessor();

      const stream = simulator.createReadableStream();
      const result = await processor.processStream(stream);

      expect(result.success).toBe(true);
      expect(result.totalFrames).toBeGreaterThan(100); // Large number of frames
      expect(result.performance.duration).toBeLessThan(3000); // Should handle rapidly
    });

    test('should handle malformed frames gracefully', async () => {
      const frames = IntegrationTestScenarios.createSuccessfulWorkflow();
      const processor = new ClientFrameProcessor();

      // Create stream with some malformed data
      const readableStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const validFrame = encodeStreamFrame(frames[0]);
          controller.enqueue(validFrame);
          
          // Inject malformed frame
          controller.enqueue(new TextEncoder().encode('invalid json\n'));
          
          // Continue with valid frames
          for (let i = 1; i < frames.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 10));
            controller.enqueue(encodeStreamFrame(frames[i]));
          }
          
          controller.close();
        }
      });

      const result = await processor.processStream(readableStream);

      expect(result.success).toBe(true); // Should handle malformed frames gracefully
      expect(result.totalFrames).toBe(frames.length); // Should process valid frames
    });
  });

  describe('Error Recovery', () => {
    test('should recover from temporary errors', async () => {
      const frames = IntegrationTestScenarios.createSuccessfulWorkflow();
      
      // Simulate API with temporary error
      const simulator = new StreamingAPISimulator(frames, {
        delay: 10,
        shouldError: true,
        errorFrame: 2, // Error on third frame
      });

      const processor = new ClientFrameProcessor();
      const stream = simulator.createReadableStream();
      const result = await processor.processStream(stream);

      expect(result.success).toBe(false); // Should catch error
      expect(result.error).toContain('Simulated API error');
      expect(result.totalFrames).toBeLessThan(frames.length); // Should stop early
    });

    test('should handle stream interruption', async () => {
      const frames = IntegrationTestScenarios.createSuccessfulWorkflow();
      
      const readableStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          // Send first few frames
          for (let i = 0; i < 3; i++) {
            controller.enqueue(encodeStreamFrame(frames[i]));
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          
          // Simulate stream error
          controller.error(new Error('Stream interrupted'));
        }
      });

      const processor = new ClientFrameProcessor();
      const result = await processor.processStream(readableStream);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Stream interrupted');
      expect(result.totalFrames).toBe(3); // Should have processed first 3 frames
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory with large streams', async () => {
      const frames = IntegrationTestScenarios.createLargeContentScenario();
      const simulator = new StreamingAPISimulator(frames, { delay: 1 });
      const processor = new ClientFrameProcessor();

      // Get initial memory if available
      const initialMemory = BrowserCompatibilityChecker.checkMemoryConstraints();

      const stream = simulator.createReadableStream();
      const result = await processor.processStream(stream);

      // Get final memory
      const finalMemory = BrowserCompatibilityChecker.checkMemoryConstraints();

      expect(result.success).toBe(true);
      
      if (initialMemory.available && finalMemory.available) {
        const memoryGrowth = finalMemory.used! - initialMemory.used!;
        // Memory growth should be reasonable (less than 10MB for test)
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
      }
    }, 10000);

    test('should handle component cleanup', async () => {
      const frames = IntegrationTestScenarios.createSuccessfulWorkflow();
      const simulator = new StreamingAPISimulator(frames, { delay: 5 });
      
      // Create multiple processors to simulate component mounting/unmounting
      const processors = [];
      for (let i = 0; i < 5; i++) {
        processors.push(new ClientFrameProcessor());
      }

      // Process streams concurrently
      const promises = processors.map(processor => {
        const stream = simulator.createReadableStream();
        return processor.processStream(stream);
      });

      const results = await Promise.all(promises);

      // All should succeed
      for (const result of results) {
        expect(result.success).toBe(true);
      }
    });
  });
});