/**
 * API route utilities for streaming workflow requests
 */

import { DEFAULT_SPEC_PACK } from "@/lib/config";

// Re-export modular utilities for cleaner organization
export {
  createErrorResponse,
  createStreamingResponse,
  createStreamController,
  handleStreamError,
} from "./streamingHelpers";

export {
  calculateMaxAttempts,
  prepareWorkflowContext,
  executeHybridWorkflow,
} from "./workflowHelpers";

export { validateApiKey, validateSpecPack } from "./validationHelpers";

// Use centralized spec pack configuration
// The pack is validated at runtime via assertValidSpecPack() to ensure type safety
const pack = DEFAULT_SPEC_PACK;

export interface RunRequestBody {
  specText: string;
  maxAttempts?: number;
}

export function isValidRunRequest(body: unknown): body is RunRequestBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "specText" in body &&
    typeof (body as RunRequestBody).specText === "string" &&
    ((body as RunRequestBody).maxAttempts === undefined ||
      typeof (body as RunRequestBody).maxAttempts === "number")
  );
}

// Export pack for consistent access
export { pack };
