"use client";

import React from "react";

import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status";
import type { CircuitBreakerState } from "@/lib/error/types";

import { STATE_CONFIG, shouldShowRecoveryTime } from "./circuit-breaker-utils";
import { RecoveryTimeDisplay } from "./recovery-time-display";
import { TestingIndicator } from "./testing-indicator";

interface CircuitBreakerStatusProps {
  state: CircuitBreakerState;
  className?: string;
}

export function CircuitBreakerStatus({
  state,
  className,
}: CircuitBreakerStatusProps) {
  const config = STATE_CONFIG[state.current];

  return (
    <div className={className}>
      <Status status={config.status}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <StatusIndicator />
            <div>
              <StatusLabel>{config.label}</StatusLabel>
              <p className="text-xs text-muted-foreground mt-1">
                {config.description}
              </p>
              {state.failureCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Failures: {state.failureCount}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {shouldShowRecoveryTime(state) && (
              <RecoveryTimeDisplay state={state} />
            )}

            {state.current === "halfOpen" && <TestingIndicator />}
          </div>
        </div>
      </Status>
    </div>
  );
}
