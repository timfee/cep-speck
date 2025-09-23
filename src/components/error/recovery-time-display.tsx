/**
 * Recovery time display component
 */

import React from "react";

import type { CircuitBreakerState } from "@/lib/error/types";

import { formatTime, getRemainingRecoveryTime } from "./circuit-breaker-utils";

interface RecoveryTimeDisplayProps {
  state: CircuitBreakerState;
}

export function RecoveryTimeDisplay({ state }: RecoveryTimeDisplayProps) {
  const remainingTime = getRemainingRecoveryTime(state);

  return (
    <div className="text-sm text-muted-foreground text-right">
      <div>Recovery in</div>
      <div className="font-mono">{formatTime(remainingTime)}</div>
    </div>
  );
}
