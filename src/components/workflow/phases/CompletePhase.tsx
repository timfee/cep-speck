import React from "react";

import { Button } from "@/components/ui/button";
import type { AgenticWorkflowState } from "@/hooks/useAgenticWorkflow";

interface CompletePhaseProps {
  state: AgenticWorkflowState;
  onReset: () => void;
}

export function CompletePhase({ state, onReset }: CompletePhaseProps) {
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(state.draft);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const getStatusMessage = () => {
    if (state.evaluationIssues.length === 0) {
      return "No issues found!";
    }
    return `${state.evaluationIssues.length} remaining issues to review.`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">✅ PRD Complete!</h2>
      <p className="text-green-600">
        Your PRD has been generated and validated. {getStatusMessage()}
      </p>
      <div className="border border-gray-300 rounded-md p-4 min-h-96 bg-white">
        <pre className="whitespace-pre-wrap text-sm">{state.draft}</pre>
      </div>
      {state.evaluationIssues.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-orange-600">
            Remaining Issues:
          </h3>
          <ul className="space-y-2 text-sm">
            {state.evaluationIssues.map((issue, index: number) => (
              <li key={index} className="border-l-4 border-orange-400 pl-3">
                <strong>{issue.section}:</strong> {issue.issue}
                <br />
                <span className="text-gray-600">{issue.suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={onReset}>Start New PRD</Button>
        <Button variant="outline" onClick={handleCopyToClipboard}>
          Copy to Clipboard
        </Button>
      </div>
    </div>
  );
}
