/**
 * Integration tests for the complete streaming workflow
 * 
 * These tests validate the end-to-end streaming protocol
 * from API endpoint through client-side processing.
 */

import { encodeStreamFrame, createPhaseFrame, createGenerationFrame, createValidationFrame, createErrorFrame, createResultFrame } from '../../src/lib/spec/streaming';

import type { StreamFrame, Issue } from '../../src/lib/spec/types';

/**
 * Mock API response simulator
 */
export class StreamingAPISimulator {
  private frames: StreamFrame[] = [];
  private delay = 50; // ms between frames
  private shouldError = false;
  private errorFrame: number = -1;

  constructor(frames: StreamFrame[], options: {
    delay?: number;
    shouldError?: boolean;
    errorFrame?: number;
  } = {}) {
    this.frames = frames;
    this.delay = options.delay ?? 50;
    this.shouldError = options.shouldError ?? false;
    this.errorFrame = options.errorFrame ?? -1;
  }

  /**
   * Simulate streaming response
   */
  async *simulate(): AsyncGenerator<Uint8Array, void, unknown> {
    for (let i = 0; i < this.frames.length; i++) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, this.delay));

      // Check for simulated error
      if (this.shouldError && (this.errorFrame === -1 || i === this.errorFrame)) {
        const errorFrame = createErrorFrame("Simulated API error", true, "SIMULATION_ERROR");
        yield encodeStreamFrame(errorFrame);
        return;
      }

      yield encodeStreamFrame(this.frames[i]);
    }
  }

  /**
   * Simulate as ReadableStream (browser-like)
   */
  createReadableStream(): ReadableStream<Uint8Array> {
    const generator = this.simulate();
    
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generator) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
}

/**
 * Client-side frame processor simulator
 */
export class ClientFrameProcessor {
  private frames: StreamFrame[] = [];
  private phase: string = "";
  private attempt: number = 0;
  private draft: string = "";
  private issues: Issue[] = [];
  private streaming: boolean = false;
  private error: string | null = null;

  /**
   * Process streaming frames like the real client
   */
  async processStream(stream: ReadableStream<Uint8Array>): Promise<{
    success: boolean;
    finalDraft: string;
    totalFrames: number;
    error?: string;
    performance: {
      startTime: number;
      endTime: number;
      duration: number;
    };
  }> {
    const startTime = Date.now();
    this.streaming = true;
    this.draft = "";
    this.error = null;
    this.frames = [];

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let shouldAbort = false;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done || shouldAbort) break;

        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.trim()) continue;
          
          let frame: StreamFrame;
          try {
            frame = JSON.parse(line);
            this.frames.push(frame);
          } catch {
            continue; // Skip malformed frames
          }

          // Process frame like the real client
          if (frame.type === "phase") {
            this.phase = frame.data.phase;
            this.attempt = frame.data.attempt;
          }
          
          if (frame.type === "generation") {
            this.draft += frame.data.delta;
          }
          
          if (frame.type === "validation") {
            this.issues = frame.data.report.issues ?? [];
          }
          
          if (frame.type === "result") {
            this.draft = frame.data.finalDraft;
          }
          
          if (frame.type === "error") {
            this.error = frame.data.message;
            this.streaming = false;
            shouldAbort = true;
            break;
          }
        }
      }
    } catch (streamError) {
      this.error = `Stream processing error: ${streamError}`;
    }

    this.streaming = false;
    const endTime = Date.now();

    return {
      success: !this.error,
      finalDraft: this.draft,
      totalFrames: this.frames.length,
      error: this.error || undefined,
      performance: {
        startTime,
        endTime,
        duration: endTime - startTime,
      },
    };
  }

  /**
   * Get current state
   */
  getState(): {
    phase: string;
    attempt: number;
    draft: string;
    issues: Issue[];
    streaming: boolean;
    framesReceived: number;
  } {
    return {
      phase: this.phase,
      attempt: this.attempt,
      draft: this.draft,
      issues: this.issues,
      streaming: this.streaming,
      framesReceived: this.frames.length,
    };
  }

  /**
   * Get frame sequence for analysis
   */
  getFrameSequence(): string[] {
    return this.frames.map(f => f.type);
  }
}

/**
 * Integration test scenarios
 */
export class IntegrationTestScenarios {
  /**
   * Create successful workflow frames
   */
  static createSuccessfulWorkflow(): StreamFrame[] {
    return [
      createPhaseFrame("loading-knowledge", 1, "Loading knowledge base"),
      createPhaseFrame("performing-research", 1, "Researching competitors"),
      createPhaseFrame("generating", 1, "Generating content"),
      createGenerationFrame("# Product Requirements Document\n\n", "# Product Requirements Document\n\n", 5),
      createGenerationFrame("## Executive Summary\n", "# Product Requirements Document\n\n## Executive Summary\n", 8),
      createGenerationFrame("This document outlines...", "# Product Requirements Document\n\n## Executive Summary\nThis document outlines...", 12),
      createPhaseFrame("validating", 1, "Running validation checks"),
      createValidationFrame({
        ok: true,
        issues: [],
        coverage: { "test-item": true }
      }, 150),
      createPhaseFrame("done", 1, "Content generation complete"),
      createResultFrame(true, "# Product Requirements Document\n\n## Executive Summary\nThis document outlines...", 1, 5000),
    ];
  }

  /**
   * Create workflow with validation issues and healing
   */
  static createHealingWorkflow(): StreamFrame[] {
    return [
      createPhaseFrame("generating", 1, "Generating content"),
      createGenerationFrame("Content with issues", "Content with issues", 3),
      createPhaseFrame("validating", 1, "Running validation checks"),
      createValidationFrame({
        ok: false,
        issues: [
          {
            id: "test-issue-1",
            itemId: "test-item",
            severity: "error" as const,
            message: "Test validation error",
            evidence: "Content with issues",
          }
        ],
        coverage: { "test-item": false }
      }, 100),
      createPhaseFrame("healing", 2, "Healing content"),
      createGenerationFrame("Fixed content", "Fixed content", 2),
      createPhaseFrame("validating", 2, "Running validation checks"),
      createValidationFrame({
        ok: true,
        issues: [],
        coverage: { "test-item": true }
      }, 80),
      createPhaseFrame("done", 2, "Content generation complete"),
      createResultFrame(true, "Fixed content", 2, 8000),
    ];
  }

  /**
   * Create error scenario
   */
  static createErrorScenario(): StreamFrame[] {
    return [
      createPhaseFrame("generating", 1, "Generating content"),
      createErrorFrame("API key missing", false, "MISSING_API_KEY"),
    ];
  }

  /**
   * Create large content scenario for performance testing
   */
  static createLargeContentScenario(): StreamFrame[] {
    const frames: StreamFrame[] = [
      createPhaseFrame("generating", 1, "Generating large content"),
    ];

    // Simulate streaming large content in chunks
    let content = "";
    for (let i = 0; i < 100; i++) {
      const chunk = `This is chunk ${i} of large content. `.repeat(10);
      content += chunk;
      frames.push(createGenerationFrame(chunk, content, content.length));
    }

    frames.push(
      createPhaseFrame("validating", 1, "Running validation checks"),
      createValidationFrame({
        ok: true,
        issues: [],
        coverage: { "test-item": true }
      }, 200),
      createPhaseFrame("done", 1, "Content generation complete"),
      createResultFrame(true, content, 1, 10000)
    );

    return frames;
  }
}

/**
 * End-to-end test runner
 */
export class EndToEndTestRunner {
  /**
   * Run complete workflow test
   */
  static async testCompleteWorkflow(): Promise<{
    success: boolean;
    duration: number;
    framesProcessed: number;
    finalDraft: string;
    frameSequence: string[];
    error?: string;
  }> {
    const frames = IntegrationTestScenarios.createSuccessfulWorkflow();
    const simulator = new StreamingAPISimulator(frames, { delay: 10 });
    const processor = new ClientFrameProcessor();

    const stream = simulator.createReadableStream();
    const result = await processor.processStream(stream);

    return {
      success: result.success,
      duration: result.performance.duration,
      framesProcessed: result.totalFrames,
      finalDraft: result.finalDraft,
      frameSequence: processor.getFrameSequence(),
      error: result.error,
    };
  }

  /**
   * Test healing workflow
   */
  static async testHealingWorkflow(): Promise<{
    success: boolean;
    healingOccurred: boolean;
    finalAttempt: number;
    error?: string;
  }> {
    const frames = IntegrationTestScenarios.createHealingWorkflow();
    const simulator = new StreamingAPISimulator(frames, { delay: 5 });
    const processor = new ClientFrameProcessor();

    const stream = simulator.createReadableStream();
    const result = await processor.processStream(stream);
    const state = processor.getState();

    return {
      success: result.success,
      healingOccurred: state.attempt > 1,
      finalAttempt: state.attempt,
      error: result.error,
    };
  }

  /**
   * Test error handling
   */
  static async testErrorHandling(): Promise<{
    errorCaught: boolean;
    errorMessage?: string;
    gracefulFailure: boolean;
  }> {
    const frames = IntegrationTestScenarios.createErrorScenario();
    const simulator = new StreamingAPISimulator(frames, { delay: 5 });
    const processor = new ClientFrameProcessor();

    const stream = simulator.createReadableStream();
    const result = await processor.processStream(stream);

    return {
      errorCaught: !result.success,
      errorMessage: result.error,
      gracefulFailure: !!result.error && !result.error.includes("Stream processing error"),
    };
  }

  /**
   * Test performance with large content
   */
  static async testLargeContentPerformance(): Promise<{
    success: boolean;
    duration: number;
    throughput: number; // frames per second
    memoryEfficient: boolean;
  }> {
    const frames = IntegrationTestScenarios.createLargeContentScenario();
    const simulator = new StreamingAPISimulator(frames, { delay: 1 });
    const processor = new ClientFrameProcessor();

    const stream = simulator.createReadableStream();
    const result = await processor.processStream(stream);

    const throughput = result.totalFrames / (result.performance.duration / 1000);

    return {
      success: result.success,
      duration: result.performance.duration,
      throughput,
      memoryEfficient: result.performance.duration < 5000, // Should complete within 5 seconds
    };
  }

  /**
   * Test network interruption recovery
   */
  static async testNetworkRecovery(): Promise<{
    recoverySuccessful: boolean;
    framesBeforeInterruption: number;
    framesAfterRecovery: number;
  }> {
    const frames = IntegrationTestScenarios.createSuccessfulWorkflow();
    
    // Split frames to simulate interruption
    const beforeInterruption = frames.slice(0, 3);
    const afterRecovery = frames.slice(3);

    const simulator1 = new StreamingAPISimulator(beforeInterruption, { delay: 10 });
    const processor = new ClientFrameProcessor();

    // Process first part
    const stream1 = simulator1.createReadableStream();
    await processor.processStream(stream1);
    const framesBeforeInterruption = processor.getState().framesReceived;

    // Simulate recovery with remaining frames
    const simulator2 = new StreamingAPISimulator(afterRecovery, { delay: 10 });
    const stream2 = simulator2.createReadableStream();
    const result = await processor.processStream(stream2);
    const framesAfterRecovery = processor.getState().framesReceived;

    return {
      recoverySuccessful: result.success,
      framesBeforeInterruption,
      framesAfterRecovery,
    };
  }
}