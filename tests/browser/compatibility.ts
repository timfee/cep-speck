/**
 * Browser Compatibility Testing Tools
 * 
 * This module provides utilities for testing the streaming protocol
 * across different browsers and network conditions.
 */

/**
 * Mock browser environment for testing
 */
export function mockBrowserEnvironment(): {
  fetch: jest.Mock;
  ReadableStream: jest.Mock;
  TextDecoder: jest.Mock;
  performance: Record<string, unknown>;
} {
  const mockFetch = jest.fn();
  const mockReader = {
    read: jest.fn(),
  };
  
  const mockReadableStream = jest.fn().mockImplementation(() => ({
    getReader: () => mockReader,
  }));
  
  const mockTextDecoder = jest.fn().mockImplementation(() => ({
    decode: jest.fn((buffer) => new TextDecoder().decode(buffer)),
  }));

  const mockPerformance = {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1024 * 1024,
      totalJSHeapSize: 2 * 1024 * 1024,
    },
  };

  return {
    fetch: mockFetch,
    ReadableStream: mockReadableStream,
    TextDecoder: mockTextDecoder,
    performance: mockPerformance,
  };
}

/**
 * Network condition simulator
 */
export class NetworkSimulator {
  private readonly latency: number = 0;
  private readonly bandwidthLimit: number = Infinity;
  private readonly dropRate: number = 0;
  private isConnected: boolean = true;

  constructor(options: {
    latency?: number;
    bandwidthLimit?: number; // bytes per second
    dropRate?: number;
    connected?: boolean;
  } = {}) {
    this.latency = options.latency ?? 0;
    this.bandwidthLimit = options.bandwidthLimit ?? Infinity;
    this.dropRate = options.dropRate ?? 0;
    this.isConnected = options.connected ?? true;
  }

  /**
   * Simulate network delay
   */
  async simulateDelay(): Promise<void> {
    if (this.latency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.latency));
    }
  }

  /**
   * Simulate packet drop
   */
  shouldDropPacket(): boolean {
    return Math.random() < this.dropRate;
  }

  /**
   * Simulate bandwidth limitations
   * @param data Data to simulate bandwidth limiting on
   * @returns Array of chunks limited by bandwidth (expects bandwidthLimit in bytes per second)
   */
  simulateBandwidth(data: Uint8Array): Uint8Array[] {
    if (this.bandwidthLimit === Infinity) {
      return [data];
    }

    const chunks: Uint8Array[] = [];
    const chunkSize = Math.max(1, Math.floor(this.bandwidthLimit)); // bandwidthLimit is in bytes per second
    
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  /**
   * Simulate connection status
   */
  isOnline(): boolean {
    return this.isConnected;
  }

  /**
   * Simulate connection interruption
   */
  disconnect(): void {
    this.isConnected = false;
  }

  /**
   * Simulate connection restoration
   */
  reconnect(): void {
    this.isConnected = true;
  }
}

/**
 * Cross-browser compatibility checker
 */
export class BrowserCompatibilityChecker {
  /**
   * Check if streaming features are supported
   */
  static checkStreamingSupport(): {
    fetch: boolean;
    readableStream: boolean;
    textDecoder: boolean;
    ndjson: boolean;
    performance: boolean;
  } {
    return {
      fetch: typeof fetch !== 'undefined',
      readableStream: typeof ReadableStream !== 'undefined',
      textDecoder: typeof TextDecoder !== 'undefined',
      ndjson: true, // JSON parsing is universally supported
      performance: typeof performance !== 'undefined' && 'now' in performance,
    };
  }

  /**
   * Get browser information
   */
  static getBrowserInfo(): {
    userAgent: string;
    vendor: string;
    language: string;
    platform: string;
    cookieEnabled: boolean;
    onLine: boolean;
  } {
    if (typeof navigator === 'undefined') {
      return {
        userAgent: 'Node.js Test Environment',
        vendor: 'Node.js',
        language: 'en-US',
        platform: 'Node.js',
        cookieEnabled: false,
        onLine: true,
      };
    }

    return {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor || 'Unknown',
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    };
  }

  /**
   * Check memory constraints
   */
  static checkMemoryConstraints(): {
    available: boolean;
    used?: number;
    total?: number;
    limit?: number;
  } {
    if (typeof performance !== 'undefined' && (performance as unknown as Record<string, unknown>).memory) {
      const memory = (performance as unknown as Record<string, unknown>).memory as {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
      return {
        available: true,
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }

    return { available: false };
  }
}

/**
 * Frame processing performance monitor
 */
export class FramePerformanceMonitor {
  private frameTimestamps: number[] = [];
  private processingTimes: number[] = [];
  private memorySnapshots: Array<{ timestamp: number; used: number; total: number }> = [];

  /**
   * Record frame processing start
   */
  startFrameProcessing(): number {
    const timestamp = performance.now();
    this.frameTimestamps.push(timestamp);
    
    // Record memory snapshot if available
    const memory = BrowserCompatibilityChecker.checkMemoryConstraints();
    if (memory.available) {
      this.memorySnapshots.push({
        timestamp,
        used: memory.used!,
        total: memory.total!,
      });
    }
    
    return timestamp;
  }

  /**
   * Record frame processing end
   */
  endFrameProcessing(startTimestamp: number): number {
    const endTime = performance.now();
    const processingTime = endTime - startTimestamp;
    this.processingTimes.push(processingTime);
    return processingTime;
  }

  /**
   * Get performance statistics
   */
  getStatistics(): {
    frameRate: number;
    avgProcessingTime: number;
    maxProcessingTime: number;
    minProcessingTime: number;
    memoryGrowth: number;
    totalFrames: number;
  } {
    const now = performance.now();
    const recentFrames = this.frameTimestamps.filter(ts => now - ts < 1000);
    
    const avgProcessingTime = this.processingTimes.length > 0
      ? this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length
      : 0;

    const maxProcessingTime = this.processingTimes.length > 0
      ? Math.max(...this.processingTimes)
      : 0;

    const minProcessingTime = this.processingTimes.length > 0
      ? Math.min(...this.processingTimes)
      : 0;

    const memoryGrowth = this.memorySnapshots.length >= 2
      ? this.memorySnapshots[this.memorySnapshots.length - 1].used - this.memorySnapshots[0].used
      : 0;

    return {
      frameRate: recentFrames.length,
      avgProcessingTime,
      maxProcessingTime,
      minProcessingTime,
      memoryGrowth,
      totalFrames: this.frameTimestamps.length,
    };
  }

  /**
   * Reset monitoring data
   */
  reset(): void {
    this.frameTimestamps = [];
    this.processingTimes = [];
    this.memorySnapshots = [];
  }
}

/**
 * Streaming protocol test runner for browsers
 */
export class BrowserStreamingTester {
  private readonly networkSim: NetworkSimulator;
  private readonly perfMonitor: FramePerformanceMonitor;

  constructor(networkConditions?: {
    latency?: number;
    bandwidthLimit?: number;
    dropRate?: number;
  }) {
    this.networkSim = new NetworkSimulator(networkConditions);
    this.perfMonitor = new FramePerformanceMonitor();
  }

  /**
   * Test frame parsing under various conditions
   */
  async testFrameParsing(frames: Uint8Array[]): Promise<{
    success: boolean;
    framesProcessed: number;
    errors: string[];
    performance: Record<string, unknown>;
  }> {
    const errors: string[] = [];
    let framesProcessed = 0;

    try {
      for (const frameData of frames) {
        if (!this.networkSim.isOnline()) {
          throw new Error('Network disconnected');
        }

        if (this.networkSim.shouldDropPacket()) {
          errors.push('Packet dropped due to network simulation');
          continue;
        }

        await this.networkSim.simulateDelay();

        const startTime = this.perfMonitor.startFrameProcessing();
        
        // Simulate chunked delivery
        const chunks = this.networkSim.simulateBandwidth(frameData);
        let accumulated = new Uint8Array(0);
        
        for (const chunk of chunks) {
          const combined = new Uint8Array(accumulated.length + chunk.length);
          combined.set(accumulated);
          combined.set(chunk, accumulated.length);
          accumulated = combined;
          
          await this.networkSim.simulateDelay();
        }

        // Try to parse the frame
        try {
          const decoder = new TextDecoder();
          const text = decoder.decode(accumulated);
          JSON.parse(text.trim());
          framesProcessed++;
        } catch (parseError) {
          errors.push(`Frame parsing error: ${parseError}`);
        }

        this.perfMonitor.endFrameProcessing(startTime);
      }
    } catch (error) {
      errors.push(`Streaming test error: ${error}`);
    }

    return {
      success: errors.length === 0,
      framesProcessed,
      errors,
      performance: this.perfMonitor.getStatistics(),
    };
  }

  /**
   * Test network interruption recovery
   */
  async testNetworkRecovery(frames: Uint8Array[]): Promise<{
    success: boolean;
    recoveryTime: number;
    framesLost: number;
  }> {
    let framesLost = 0;
    const startTime = performance.now();

    // Process half the frames
    const halfwayPoint = Math.floor(frames.length / 2);
    
    for (let i = 0; i < halfwayPoint; i++) {
      if (this.networkSim.shouldDropPacket()) {
        framesLost++;
      }
    }

    // Simulate network disconnection
    this.networkSim.disconnect();
    
    // Wait for recovery simulation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Reconnect
    this.networkSim.reconnect();
    
    const recoveryTime = performance.now() - startTime;

    // Process remaining frames
    for (let i = halfwayPoint; i < frames.length; i++) {
      if (this.networkSim.shouldDropPacket()) {
        framesLost++;
      }
    }

    return {
      success: this.networkSim.isOnline(),
      recoveryTime,
      framesLost,
    };
  }

  /**
   * Get network simulation statistics
   */
  getNetworkStats(): {
    latency: number;
    isOnline: boolean;
    dropRate: number;
  } {
    return {
      latency: this.networkSim['latency'],
      isOnline: this.networkSim.isOnline(),
      dropRate: this.networkSim['dropRate'],
    };
  }

  /**
   * Reset test state
   */
  reset(): void {
    this.perfMonitor.reset();
    this.networkSim.reconnect();
  }
}