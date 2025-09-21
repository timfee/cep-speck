import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export function POST(_req: NextRequest): Response {
  return new Response(
    JSON.stringify({
      error:
        "The /api/run endpoint has been replaced by /api/generate. Please update clients to call /api/generate instead.",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" },
    }
  );
}
