interface RefineIssue {
  id: string;
  message?: string;
  evidence?: string;
  hints?: string[];
}

interface RefineDraftParams {
  draft: string;
  issues: RefineIssue[];
}

export async function requestDraftRefinement({
  draft,
  issues,
}: RefineDraftParams): Promise<string> {
  const response = await fetch("/api/refine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft, issues }),
  });

  if (!response.ok) {
    throw new Error(`Refine failed: ${response.statusText}`);
  }

  const payload: unknown = await response.json();
  if (
    typeof payload === "object" &&
    payload !== null &&
    "content" in payload &&
    typeof (payload as { content: unknown }).content === "string"
  ) {
    return (payload as { content: string }).content;
  }

  throw new Error("Refine response missing content");
}
