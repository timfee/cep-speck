import type { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Legacy API endpoint - deprecated in favor of the new agentic system
 * This endpoint is maintained for backward compatibility with traditional mode
 */
export function POST(_req: NextRequest) {
  return new Response(JSON.stringify({ 
    error: "This API endpoint has been deprecated. Please use the new agentic workflow instead.",
    migration: "Switch to the agentic mode for the improved PRD generation experience."
  }), {
    status: 410, // Gone
    headers: { "Content-Type": "application/json" },
  });
}
