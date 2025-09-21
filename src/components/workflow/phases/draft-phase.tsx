import React from "react";

import type { AgenticWorkflowState } from "@/hooks/use-agentic-workflow";

interface DraftPhaseProps {
  state: AgenticWorkflowState;
}

export function DraftPhase({ state }: DraftPhaseProps) {
  const getPhaseMessage = () => {
    if (state.phase === "draft") return "🔄 Generating initial draft...";
    if (state.phase === "evaluating") return "🔍 Evaluating draft quality...";
    if (state.phase === "refining")
      return `🩹 Refining draft (attempt ${state.attempt})...`;
    return "";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 3: PRD Generation</h2>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span>{getPhaseMessage()}</span>
        </div>
      </div>
      <div className="border border-gray-300 rounded-md p-4 min-h-96 bg-gray-50">
        {state.draft ? (
          <pre className="whitespace-pre-wrap text-sm">{state.draft}</pre>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            Generating your PRD...
          </div>
        )}
      </div>
      {state.evaluationIssues.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Issues Found (Refining...):</h3>
          <ul className="space-y-1 text-sm">
            {state.evaluationIssues.map((issue, index: number) => (
              <li key={index} className="text-orange-600">
                • {issue.section}: {issue.issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
