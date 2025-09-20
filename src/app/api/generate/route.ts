import type { NextRequest } from "next/server";

import { drafterAgent } from "@/lib/agents/drafter";
import { evaluatorAgent } from "@/lib/agents/evaluator";
import { outlinerAgent } from "@/lib/agents/outliner";
import { refinerAgent } from "@/lib/agents/refiner";

export const runtime = "nodejs";

// Type definitions for agentic API
interface BaseRequest {
  phase: string;
}

interface OutlineRequest extends BaseRequest {
  phase: "outline";
  brief: string;
}

interface DraftRequest extends BaseRequest {
  phase: "draft";
  outline: StructuredOutline;
}

interface EvaluateRequest extends BaseRequest {
  phase: "evaluate";
  draft: string;
}

interface RefineRequest extends BaseRequest {
  phase: "refine";
  draft: string;
  report: EvaluationReport;
}

type GenerateRequest =
  | OutlineRequest
  | DraftRequest
  | EvaluateRequest
  | RefineRequest;

// Type definitions for data contracts
interface StructuredOutline {
  sections: Array<{
    id: string;
    title: string;
    notes: string;
  }>;
}

type EvaluationReport = Array<{
  section: string;
  issue: string;
  evidence: string;
  suggestion: string;
}>;

function isValidGenerateRequest(body: unknown): body is GenerateRequest {
  if (typeof body !== "object" || body === null || !("phase" in body)) {
    return false;
  }

  const { phase } = body as BaseRequest;

  switch (phase) {
    case "outline":
      return (
        "brief" in body && typeof (body as OutlineRequest).brief === "string"
      );
    case "draft":
      return (
        "outline" in body && typeof (body as DraftRequest).outline === "object"
      );
    case "evaluate":
      return (
        "draft" in body && typeof (body as EvaluateRequest).draft === "string"
      );
    case "refine":
      return (
        "draft" in body &&
        "report" in body &&
        typeof (body as RefineRequest).draft === "string" &&
        Array.isArray((body as RefineRequest).report)
      );
    default:
      return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const requestBody: unknown = await req.json();

    if (!isValidGenerateRequest(requestBody)) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          phase:
            "phase" in (requestBody as Record<string, unknown>)
              ? String((requestBody as Record<string, unknown>).phase)
              : "unknown",
          recoverable: false,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { phase } = requestBody;

    // Route to appropriate agent based on phase
    switch (phase) {
      case "outline": {
        const { brief } = requestBody;
        const outline = await outlinerAgent(brief);
        return new Response(JSON.stringify(outline), {
          headers: { "Content-Type": "application/json" },
        });
      }

      case "draft": {
        const { outline } = requestBody;
        // Return streaming response for draft generation
        const stream = drafterAgent(outline);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked",
          },
        });
      }

      case "evaluate": {
        const { draft } = requestBody;
        const report = await evaluatorAgent(draft);
        return new Response(JSON.stringify(report), {
          headers: { "Content-Type": "application/json" },
        });
      }

      case "refine": {
        const { draft, report } = requestBody;
        // Return streaming response for refinement
        const stream = refinerAgent(draft, report);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked",
          },
        });
      }

      default:
        return new Response(
          JSON.stringify({
            error: `Unknown phase: ${String(phase)}`,
            phase: String(phase),
            recoverable: false,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Generate API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        phase: "unknown",
        recoverable: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
