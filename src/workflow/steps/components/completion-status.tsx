import { CheckCircle } from "lucide-react";
import React from "react";

interface CompletionStatusProps {
  totalItems: number;
}

export function CompletionStatus({ totalItems }: CompletionStatusProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center space-x-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
        <CheckCircle className="h-4 w-4" />
        <span>
          Content outline looks comprehensive. You can proceed to configure
          enterprise parameters.
        </span>
      </div>
    </div>
  );
}
