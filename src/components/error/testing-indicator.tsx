/**
 * Testing indicator component for half-open state
 */

import React from "react";

import { Spinner } from "@/components/ui/spinner";

export function TestingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <Spinner variant="ellipsis" size={16} className="text-amber-500" />
      <span className="text-xs text-muted-foreground">Testing...</span>
    </div>
  );
}
