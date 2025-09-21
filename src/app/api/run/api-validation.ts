/**
 * Validation helpers for API route
 */

import { assertValidSpecPack } from "@/lib/spec/pack-validate";

import {
  createErrorFrame,
  encodeStreamFrame,
  StreamingError,
} from "@/lib/spec/streaming";

export function validateApiKey(streamController: {
  enqueue: (frame: Uint8Array) => void;
  close: () => void;
}): boolean {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if ((apiKey ?? "").length === 0) {
    const errorFrame = createErrorFrame(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY on server. Add it to .env.local and restart.",
      false,
      "MISSING_API_KEY"
    );
    streamController.enqueue(encodeStreamFrame(errorFrame));
    streamController.close();
    return false;
  }
  return true;
}

import type { SpecPack } from "@/lib/spec/types";

export function validateSpecPack(
  pack: SpecPack,
  streamController: { enqueue: (frame: Uint8Array) => void; close: () => void }
): boolean {
  try {
    assertValidSpecPack(pack);
    return true;
  } catch (error) {
    if (error instanceof StreamingError) {
      streamController.enqueue(encodeStreamFrame(error.toStreamFrame()));
      streamController.close();
      return false;
    }
    throw error;
  }
}
