import type { EvaluationReport, StructuredOutline } from "@/lib/agents";

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data.error === "string" && data.error.length > 0) {
      return data.error;
    }
  } catch (error) {
    console.warn("Failed to parse error response", error);
  }

  return `${response.status} ${response.statusText}`;
}

export async function requestOutline(
  brief: string
): Promise<StructuredOutline> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phase: "outline", brief }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as StructuredOutline;
}

async function readTextStream(
  response: Response,
  onUpdate: (content: string) => void
): Promise<string> {
  if (!response.body) {
    throw new Error("No response body available");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      onUpdate(buffer);
    }

    buffer += decoder.decode();
    onUpdate(buffer);
  } finally {
    reader.releaseLock();
  }

  return buffer;
}

export async function streamDraft(
  outline: StructuredOutline,
  onUpdate: (content: string) => void
): Promise<string> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phase: "draft", outline }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return await readTextStream(response, onUpdate);
}

export async function requestEvaluation(
  draft: string
): Promise<EvaluationReport> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phase: "evaluate", draft }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as EvaluationReport;
}

export async function streamRefinement(
  draft: string,
  report: EvaluationReport,
  onUpdate: (content: string) => void
): Promise<string> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phase: "refine", draft, report }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return await readTextStream(response, onUpdate);
}
