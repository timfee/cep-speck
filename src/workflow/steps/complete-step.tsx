"use client";

import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";

interface CompleteStepProps {
  generatedPrd: string;
}

export function CompleteStep({ generatedPrd }: CompleteStepProps) {
  const { copy, isSupported } = useClipboard();

  const handleCopyToClipboard = async () => {
    if (generatedPrd.length === 0) {
      return;
    }

    await copy(generatedPrd);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">PRD Complete</h2>
        <p className="text-muted-foreground mb-6">
          Your PRD has been successfully generated using the consolidated
          semantic validation system.
        </p>
      </div>

      {generatedPrd.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Final PRD:</h3>
            <Button
              variant="outline"
              onClick={handleCopyToClipboard}
              disabled={!isSupported}
            >
              Copy to Clipboard
            </Button>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{generatedPrd}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
