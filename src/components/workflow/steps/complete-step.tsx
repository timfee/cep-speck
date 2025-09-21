import { Button } from "@/components/ui/button";

interface CompleteStepProps {
  generatedPrd: string;
}

export function CompleteStep({ generatedPrd }: CompleteStepProps) {
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrd);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
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
            <Button variant="outline" onClick={handleCopyToClipboard}>
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
