/**
 * API route utilities for streaming workflow requests
 */

import { z } from "zod";

import { DEFAULT_SPEC_PACK } from "@/lib/config";

import type {
  SerializedWorkflowOutline,
  SerializedWorkflowSpec,
} from "@/types/workflow";

// Re-export modular utilities for cleaner organization
export {
  createErrorResponse,
  createStreamingResponse,
  createStreamController,
  handleStreamError,
} from "./streaming-response";

export {
  calculateMaxAttempts,
  prepareWorkflowContext,
  executeHybridWorkflow,
} from "./workflow-execution";

export { validateApiKey, validateSpecPack } from "./api-validation";

// Use centralized spec pack configuration
// The pack is validated at runtime via assertValidSpecPack() to ensure type safety
const pack = DEFAULT_SPEC_PACK;

const isSerializableObject = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const serializedSpecSchema = z.custom<SerializedWorkflowSpec>((value) => {
  if (!isSerializableObject(value)) {
    return false;
  }

  return true;
}, "structuredSpec must be an object");

const outlinePayloadSchema = z.custom<SerializedWorkflowOutline>((value) => {
  if (!isSerializableObject(value)) {
    return false;
  }

  return true;
}, "outlinePayload must be an object");

export const runRequestBodySchema = z
  .object({
    specText: z.string(),
    structuredSpec: serializedSpecSchema.optional(),
    outlinePayload: outlinePayloadSchema.optional(),
    maxAttempts: z.number().optional(),
  })
  .strict();

export type RunRequestBody = z.infer<typeof runRequestBodySchema>;

export function isValidRunRequest(body: unknown): body is RunRequestBody {
  return runRequestBodySchema.safeParse(body).success;
}

// Export pack for consistent access
export { pack };
