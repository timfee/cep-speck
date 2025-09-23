import { Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface GenerateActionsProps {
  showGenerate: boolean;
  showRegenerate: boolean;
  onGenerate: () => void | Promise<void>;
}

export function GenerateActions({
  showGenerate,
  showRegenerate,
  onGenerate,
}: GenerateActionsProps) {
  return (
    <>
      {showGenerate && (
        <div className="flex justify-center">
          <Button onClick={onGenerate} size="lg" className="min-w-[200px]">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate PRD
          </Button>
        </div>
      )}

      {showRegenerate && (
        <div className="flex justify-center">
          <Button onClick={onGenerate} variant="outline" size="lg">
            <Wand2 className="mr-2 h-4 w-4" />
            Regenerate PRD
          </Button>
        </div>
      )}
    </>
  );
}
