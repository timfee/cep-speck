/**
 * API route utilities for streaming workflow requests
 */

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

export interface RunRequestBody {
  specText: string;
  structuredSpec?: SerializedWorkflowSpec;
  outlinePayload?: SerializedWorkflowOutline;
  maxAttempts?: number;
}

export function isValidRunRequest(body: unknown): body is RunRequestBody {
  if (typeof body !== "object" || body === null || !("specText" in body)) {
    return false;
  }

  const candidate = body as {
    specText?: unknown;
    structuredSpec?: unknown;
    outlinePayload?: unknown;
    maxAttempts?: unknown;
  };

  const maxAttemptsValid =
    candidate.maxAttempts === undefined ||
    typeof candidate.maxAttempts === "number";

  const structuredSpecValid =
    candidate.structuredSpec === undefined ||
    (typeof candidate.structuredSpec === "object" &&
      candidate.structuredSpec !== null);

  const outlinePayloadValid =
    candidate.outlinePayload === undefined ||
    (typeof candidate.outlinePayload === "object" &&
      candidate.outlinePayload !== null);

  return (
    typeof candidate.specText === "string" &&
    maxAttemptsValid &&
    structuredSpecValid &&
    outlinePayloadValid
  );
}

// Export pack for consistent access
export { pack };
