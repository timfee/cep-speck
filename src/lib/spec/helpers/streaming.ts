/**
 * Robust stream processing with buffering and error recovery
 * Consolidated from lib/streaming/stream-processor.ts
 */

import type { StreamFrame } from "@/lib/spec/types";

export class StreamProcessor {
  private buffer = "";
  private readonly decoder = new TextDecoder();

  /**
   * Process chunk of data from stream with buffering for incomplete JSON
   */
  processChunk(chunk: Uint8Array): StreamFrame[] {
    // Decode and add to buffer
    this.buffer += this.decoder.decode(chunk, { stream: true });

    // Split by newlines and process complete lines
    const lines = this.buffer.split("\n");

    // Keep incomplete line in buffer
    this.buffer = lines[lines.length - 1];

    // Process complete lines
    const frames: StreamFrame[] = [];
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const frame = JSON.parse(line) as StreamFrame;
        if (this.isValidStreamFrame(frame)) {
          frames.push(frame);
        } else {
          console.warn("Invalid frame structure:", line);
        }
      } catch {
        console.warn("Invalid JSON frame:", line);
      }
    }

    return frames;
  }

  /**
   * Flush remaining buffered content
   */
  flush(): StreamFrame[] {
    if (!this.buffer.trim()) return [];

    try {
      const frame = JSON.parse(this.buffer) as StreamFrame;
      if (this.isValidStreamFrame(frame)) {
        return [frame];
      }
    } catch {
      console.warn("Failed to parse final buffered content:", this.buffer);
    }

    return [];
  }

  /**
   * Reset processor state
   */
  reset(): void {
    this.buffer = "";
  }

  /**
   * Validate stream frame structure
   */
  private isValidStreamFrame(obj: unknown): obj is StreamFrame {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "type" in obj &&
      typeof (obj as StreamFrame).type === "string" &&
      "data" in obj
    );
  }
}
