import type { NextRequest } from "next/server";

import { runRefinerAgentComplete } from "@/lib/agents";
import type { Issue } from "@/lib/spec/types";

export const runtime = "nodejs";

interface RefineRequestBody {
  draft: string;
  issues: Issue[];
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Partial<RefineRequestBody>;

  if (typeof payload.draft !== "string" || !Array.isArray(payload.issues)) {
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }

  try {
    const result = await runRefinerAgentComplete(payload.draft, payload.issues);

    return Response.json({ content: result.content });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to refine document";
    return Response.json({ error: message }, { status: 500 });
  }
}
