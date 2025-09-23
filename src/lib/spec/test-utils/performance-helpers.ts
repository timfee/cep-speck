/**
 * Performance testing utilities
 */

/**
 * Simulate network delays for testing
 */
export function simulateNetworkDelay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  return {
    used: 0,
    total: 0,
    available: false,
  };
}
