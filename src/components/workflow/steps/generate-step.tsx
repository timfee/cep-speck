import { Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface GenerateStepProps {
  error: string | null;
  isGenerating: boolean;
  generatedPrd: string;
  onGenerate: () => void;
}

export function GenerateStep({
  error,
  isGenerating,
  generatedPrd,
  onGenerate,
}: GenerateStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Generate PRD</h2>
        <p className="text-muted-foreground mb-6">
          Ready to generate your comprehensive PRD using the consolidated
          validation system.
        </p>
      </div>

      {error != null && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="lg"
          className="min-w-48"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate PRD"}
        </Button>
      </div>

      {isGenerating && generatedPrd.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Content Preview:</h3>
          <div className="p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{generatedPrd}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
