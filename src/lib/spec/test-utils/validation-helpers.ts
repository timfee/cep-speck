/**
 * Test validation and parsing utilities
 */
import type { StreamFrame } from "../types";

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
