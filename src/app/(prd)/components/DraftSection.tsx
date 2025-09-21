import { ErrorDisplay } from "@/components/error";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TerminalDisplay } from "@/components/ui/typing-text";
import type { ErrorDetails } from "@/lib/error/types";
import type { Issue } from "@/lib/spec/types";

interface DraftSectionProps {
  draft: string;
  issues: Issue[];
  errorDetails: ErrorDetails | null;
  streaming: boolean;
  onRetry: () => void;
  onConfigureApi: () => void;
}

/**
 * Component for displaying the draft output and issues
 */
export function DraftSection({
  draft,
  issues,
  errorDetails,
  streaming,
  onRetry,
  onConfigureApi,
}: DraftSectionProps) {
  return (
    <Card className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">Draft</h2>

      {/* Enhanced Error Display */}
      {errorDetails ? (
        <ErrorDisplay
          error={errorDetails}
          onRetry={onRetry}
          onConfigureApi={onConfigureApi}
        />
      ) : draft ? (
        <TerminalDisplay
          content={draft}
          title="PRD Generation Output"
          streaming={streaming}
        />
      ) : (
        <div className="min-h-[200px] flex items-center justify-center text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
          {streaming
            ? "Generating content..."
            : "Click 'Run' to generate your PRD"}
        </div>
      )}

      <Separator />
      <h3 className="text-md font-medium">Issues</h3>
      <div className="space-y-2">
        {issues.length === 0 ? (
          <div className="text-sm text-muted-foreground">None</div>
        ) : (
          issues.map((it, idx) => (
            <div key={idx} className="text-sm">
              <Badge className="mr-2">{it.itemId}</Badge>
              {it.message}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
