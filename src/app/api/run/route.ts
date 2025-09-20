import type { NextRequest } from "next/server";

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

export async function POST(req: NextRequest) {
  const requestBody: unknown = await req.json();

  if (!isValidRunRequest(requestBody)) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Return error directing to new API
  return new Response(
    JSON.stringify({
      error:
        "Legacy /api/run endpoint has been replaced with the new agentic /api/generate endpoint. Please update your frontend to use the new phase-based API.",
      deprecated: true,
      replacement: "/api/generate",
      migration_required: true,
    }),
    {
      status: 410, // Gone
      headers: { "Content-Type": "application/json" },
    }
  );
}
