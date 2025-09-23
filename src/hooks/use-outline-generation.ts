import { useCallback } from "react";

import { generateContentOutlineFromPrompt } from "@/lib/services/content-outline-service";

import type { WorkflowSetters } from "./workflow-setters";

export function useOutlineGeneration(setters: WorkflowSetters) {
  return useCallback(
    async (prompt: string) => {
      await generateOutlineForPrompt(prompt, setters);
    },
    [setters]
  );
}

async function generateOutlineForPrompt(
  prompt: string,
  setters: WorkflowSetters
): Promise<void> {
  setters.setLoading(true);
  setters.setError(undefined);

  try {
    const outline = await generateContentOutlineFromPrompt(prompt);
    setters.setContentOutline(outline);
  } catch (error) {
    setters.setError(getOutlineErrorMessage(error));
    console.error("Content outline generation failed:", error);
  } finally {
    setters.setLoading(false);
  }
}

function getOutlineErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Failed to generate content outline";
}
