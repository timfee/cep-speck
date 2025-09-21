import type { NextRequest } from "next/server";

import { runGenerationLoop } from "@/lib/agents/hybridWorkflow";
import { DEFAULT_SPEC_PACK } from "@/lib/config";

import {
  loadKnowledgeBase,
  performResearch,
} from "@/lib/spec/api/workflowHelpers";

import "@/lib/spec/items";
import { assertValidSpecPack } from "@/lib/spec/packValidate";

import {
  createErrorFrame,
  encodeStreamFrame,
  StreamingError,
} from "@/lib/spec/streaming";

export const runtime = "nodejs";

// Define proper types for request body
interface RunRequestBody {
  specText: string;
  maxAttempts?: number;
}

// Validate request body structure
function isValidRunRequest(body: unknown): body is RunRequestBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "specText" in body &&
    typeof (body as RunRequestBody).specText === "string" &&
    ((body as RunRequestBody).maxAttempts === undefined ||
      typeof (body as RunRequestBody).maxAttempts === "number")
  );
}

// Use centralized spec pack configuration
// The pack is validated at runtime via assertValidSpecPack() to ensure type safety
const pack = DEFAULT_SPEC_PACK;

// Constants for magic numbers
const MAX_ALLOWED_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const requestBody: unknown = await req.json();

  if (!isValidRunRequest(requestBody)) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { specText, maxAttempts: maxOverride } = requestBody;
  const maxAttempts = Math.min(
    maxOverride ?? pack.healPolicy.maxAttempts,
    MAX_ALLOWED_ATTEMPTS
  );

  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      let controllerClosed = false;

      const safeClose = () => {
        if (!controllerClosed) {
          controller.close();
          controllerClosed = true;
        }
      };

      const safeEnqueue = (frame: Uint8Array) => {
        if (!controllerClosed) {
          controller.enqueue(frame);
        }
      };

      try {
        // API key check
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if ((apiKey ?? "").length === 0) {
          const errorFrame = createErrorFrame(
            "Missing GOOGLE_GENERATIVE_AI_API_KEY on server. Add it to .env.local and restart.",
            false, // Not recoverable without restart
            "MISSING_API_KEY"
          );
          safeEnqueue(encodeStreamFrame(errorFrame));
          safeClose();
          return;
        }

        // Validate pack structure
        try {
          assertValidSpecPack(pack);
        } catch (error) {
          if (error instanceof StreamingError) {
            safeEnqueue(encodeStreamFrame(error.toStreamFrame()));
            safeClose();
            return;
          }
          throw error;
        }

        // Phase 1 & 2: Load knowledge and perform research
        const workflowContext = {
          specText,
          pack,
          maxAttempts,
          startTime,
          safeEnqueue,
        };

        const knowledgeContext = await loadKnowledgeBase(workflowContext);
        const researchContext = performResearch(workflowContext);

        // Run the hybrid generation loop
        await runGenerationLoop({
          specText,
          knowledgeContext,
          researchContext,
          pack,
          maxAttempts,
          startTime,
          safeEnqueue,
        });

        safeClose();
      } catch (e: unknown) {
        const error =
          e instanceof StreamingError
            ? e
            : new StreamingError(
                e instanceof Error ? e.message : String(e),
                false, // Unexpected errors are not recoverable
                "UNEXPECTED_ERROR",
                e
              );

        safeEnqueue(encodeStreamFrame(error.toStreamFrame()));
        safeClose();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}
