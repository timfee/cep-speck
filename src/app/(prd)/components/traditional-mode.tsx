import { Wand2 } from "lucide-react";
import { useState } from "react";

import { ApiKeyDialog } from "@/components/error";
import { Button } from "@/components/ui/button";

import { DraftSection } from "./draft-section";
import { SpecSection } from "./spec-section";
import { useElapsedTimeTracker } from "../hooks/use-elapsed-time-tracker";
import { useSpecValidation } from "../hooks/use-spec-validation";
import { useStreamingWorkflow } from "../hooks/use-streaming-workflow";
import { useWorkflowMetrics } from "../hooks/use-workflow-metrics";

interface TraditionalModeProps {
  onStructuredMode: () => void;
}

export function TraditionalMode({ onStructuredMode }: TraditionalModeProps) {
  const [spec, setSpec] = useState<string>(
    "Project: Example\nTarget SKU: premium\n\n"
  );
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const {
    streaming,
    phase,
    attempt,
    draft,
    issues,
    startTime,
    elapsedTime,
    errorDetails,
    setElapsedTime,
    startWorkflow,
  } = useStreamingWorkflow();

  const validation = useSpecValidation(spec);

  const workflowMetrics = useWorkflowMetrics({
    draft,
    issues,
    attempt,
    elapsedTime,
    phase,
  });

  // Track elapsed time during streaming
  useElapsedTimeTracker(streaming, startTime, setElapsedTime);

  return (
    <div className="p-6 space-y-6">
      {/* Mode switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PRD Generator</h1>
          <p className="text-muted-foreground">
            Create comprehensive Product Requirements Documents with AI
            assistance
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onStructuredMode}
          className="flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Try Structured Wizard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpecSection
          spec={spec}
          onSpecChange={setSpec}
          validation={validation}
          streaming={streaming}
          phase={phase}
          attempt={attempt}
          workflowMetrics={workflowMetrics}
          onStartWorkflow={() => startWorkflow(spec)}
        />

        <DraftSection
          draft={draft}
          issues={issues}
          errorDetails={errorDetails}
          streaming={streaming}
          onRetry={() => startWorkflow(spec)}
          onConfigureApi={() => setShowApiKeyDialog(true)}
        />
      </div>

      {/* API Key Configuration Dialog */}
      <ApiKeyDialog
        isOpen={showApiKeyDialog}
        onClose={() => setShowApiKeyDialog(false)}
      />
    </div>
  );
}
