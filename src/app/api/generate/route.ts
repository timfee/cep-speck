import type { NextRequest } from "next/server";

import {
  runDrafterAgent,
  runEvaluatorAgent,
  runOutlinerAgent,
  runRefinerAgent,
  type AgentPhase,
  type EvaluationIssue,
  type EvaluationReport,
  type OutlineSection,
  type StructuredOutline,
} from "@/lib/agents";

export const runtime = "nodejs";

type GenerateRequestBody = {
  phase?: unknown;
  brief?: unknown;
  outline?: unknown;
  draft?: unknown;
  report?: unknown;
};

function requireApiKey() {
  if ((process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "").length === 0) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY on server");
  }
}

function isOutlineSection(value: unknown): value is OutlineSection {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as OutlineSection).id === "string" &&
    (value as OutlineSection).id.length > 0 &&
    typeof (value as OutlineSection).title === "string" &&
    (value as OutlineSection).title.length > 0 &&
    (typeof (value as OutlineSection).notes === "string" ||
      typeof (value as OutlineSection).notes === "undefined")
  );
}

function isStructuredOutline(value: unknown): value is StructuredOutline {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as StructuredOutline).sections) &&
    (value as StructuredOutline).sections.every(isOutlineSection)
  );
}

function isEvaluationIssue(value: unknown): value is EvaluationIssue {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as EvaluationIssue).section === "string" &&
    (value as EvaluationIssue).section.length > 0 &&
    typeof (value as EvaluationIssue).issue === "string" &&
    (value as EvaluationIssue).issue.length > 0 &&
    (typeof (value as EvaluationIssue).evidence === "string" ||
      typeof (value as EvaluationIssue).evidence === "undefined") &&
    (typeof (value as EvaluationIssue).suggestion === "string" ||
      typeof (value as EvaluationIssue).suggestion === "undefined")
  );
}

function isEvaluationReport(value: unknown): value is EvaluationReport {
  return Array.isArray(value) && value.every(isEvaluationIssue);
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

async function handleOutline(body: GenerateRequestBody): Promise<Response> {
  const brief = body.brief;
  if (typeof brief !== "string" || brief.trim().length === 0) {
    return jsonError("Outline phase requires a non-empty brief", 400);
  }
  requireApiKey();
  const outline = await runOutlinerAgent(brief);
  return jsonResponse(outline);
}

async function handleDraft(body: GenerateRequestBody): Promise<Response> {
  const outline = body.outline;
  if (!isStructuredOutline(outline)) {
    return jsonError("Draft phase requires a valid outline", 400);
  }
  requireApiKey();
  const stream = await runDrafterAgent(outline);
  return stream.toTextStreamResponse({
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function handleEvaluate(body: GenerateRequestBody): Promise<Response> {
  const draft = body.draft;
  if (typeof draft !== "string" || draft.trim().length === 0) {
    return jsonError("Evaluate phase requires a non-empty draft", 400);
  }
  requireApiKey();
  const report = await runEvaluatorAgent(draft);
  return jsonResponse(report);
}

async function handleRefine(body: GenerateRequestBody): Promise<Response> {
  const draft = body.draft;
  const report = body.report;
  if (typeof draft !== "string" || draft.trim().length === 0) {
    return jsonError("Refine phase requires a non-empty draft", 400);
  }
  if (!isEvaluationReport(report)) {
    return jsonError("Refine phase requires a valid evaluation report", 400);
  }
  requireApiKey();
  const stream = await runRefinerAgent(draft, report);
  return stream.toTextStreamResponse({
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

const PHASE_HANDLERS: Record<
  AgentPhase,
  (body: GenerateRequestBody) => Promise<Response>
> = {
  outline: handleOutline,
  draft: handleDraft,
  evaluate: handleEvaluate,
  refine: handleRefine,
};

export async function POST(req: NextRequest): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch (error) {
    console.warn("/api/generate failed to parse JSON", error);
    return jsonError("Invalid JSON payload", 400);
  }

  if (typeof rawBody !== "object" || rawBody === null) {
    return jsonError("Request body must be an object", 400);
  }

  const body = rawBody as GenerateRequestBody;

  const phase =
    typeof body.phase === "string" ? (body.phase as AgentPhase) : undefined;
  if (!phase) {
    return jsonError("Missing phase in request body", 400);
  }

  if (!Object.prototype.hasOwnProperty.call(PHASE_HANDLERS, phase)) {
    return jsonError(`Unsupported phase: ${String(body.phase)}`, 400);
  }

  const handler = PHASE_HANDLERS[phase];

  try {
    return await handler(body);
  } catch (error) {
    console.error("/api/generate error", error);
    return jsonError(
      error instanceof Error ? error.message : "Unexpected server error",
      500
    );
  }
}
