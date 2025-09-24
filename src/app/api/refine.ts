import type { NextRequest } from "next/server";

import { runRefinerAgentComplete } from "@/lib/agents/refiner";

export const runtime = "nodejs";

interface ValidationIssue {
  code: string;
  message: string;
  severity: "error" | "warn";
}

interface RefineRequestBody {
  draft: string;
  issues: ValidationIssue[];
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Partial<RefineRequestBody>;

  if (typeof payload.draft !== "string" || !Array.isArray(payload.issues)) {
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }

  try {
    // Convert API issues to internal Issue format
    const issues = payload.issues.map((issue, index) => ({
      id: `api-issue-${index}`,
      code: issue.code,
      message: issue.message,
      severity: issue.severity,
      itemId: "api-validation",
      description: issue.message,
      recoverable: true,
    }));

    const result = await runRefinerAgentComplete(payload.draft, issues);

    return Response.json({ content: result.content });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to refine document";
    return Response.json({ error: message }, { status: 500 });
  }
}
