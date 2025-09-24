import type { NextRequest } from "next/server";

import { generateContentOutlineFromPrompt } from "@/lib/services/content-outline-service";

export const runtime = "nodejs";

interface ContentOutlineRequest {
  prompt: string;
}

export async function POST(req: NextRequest) {
  try {
    const requestBody: unknown = await req.json();

    if (!isValidContentOutlineRequest(requestBody)) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body. Expected { prompt: string }",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { prompt } = requestBody;

    // Generate content outline using AI (server-side only)
    const result = await generateContentOutlineFromPrompt(prompt);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Content outline API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function isValidContentOutlineRequest(
  body: unknown
): body is ContentOutlineRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    "prompt" in body &&
    typeof body.prompt === "string" &&
    body.prompt.length > 0
  );
}
