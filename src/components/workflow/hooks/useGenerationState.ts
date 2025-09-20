import { useState } from "react";

export function useGenerationState() {
  const [generatedPrd, setGeneratedPrd] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setGeneratedPrd("");
    setIsGenerating(false);
    setError(null);
  };

  return {
    generatedPrd,
    isGenerating,
    error,
    setGeneratedPrd,
    setIsGenerating,
    setError,
    resetState,
  } as const;
}

// Helper function to process streaming frames
export function processStreamFrame(
  line: string,
  updateContent: (content: string) => void,
  setFinalContent: (content: string) => void
): boolean {
  try {
    const frame = JSON.parse(line) as {
      type: string;
      data?: { content?: string; draft?: string; message?: string };
    };

    switch (frame.type) {
      case "generation":
        if (frame.data?.content != null) {
          updateContent(frame.data.content);
        }
        break;

      case "result":
        if (frame.data?.draft != null) {
          setFinalContent(frame.data.draft);
        }
        break;

      case "error":
        throw new Error(frame.data?.message ?? "Generation failed");

      default:
        // Skip unknown frame types
        break;
    }

    return false; // Continue processing
  } catch (parseError) {
    // Skip invalid JSON lines
    console.warn("Failed to parse streaming line:", line, "Error:", parseError);
    return false; // Continue processing
  }
}

export async function processStreamingResponse(
  response: Response,
  onContent: (content: string) => void,
  onFinal: (content: string) => void
): Promise<void> {
  if (!response.body) {
    throw new Error("No response body available");
  }

  const reader = response.body.getReader();
  let accumulatedContent = "";
  const decoder = new TextDecoder();

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        const shouldStop = processStreamFrame(
          line,
          (content: string) => {
            accumulatedContent += content;
            onContent(accumulatedContent);
          },
          (content: string) => {
            onFinal(content);
            accumulatedContent = content;
          }
        );

        if (shouldStop) {
          return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
