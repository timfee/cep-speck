"use client";

import React from "react";

import { Spinner } from "@/components/ui/spinner";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status";
import type { CircuitBreakerState } from "@/lib/error/types";

interface CircuitBreakerStatusProps {
  state: CircuitBreakerState;
  className?: string;
}

// Time conversion constants
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

function formatTime(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / MILLISECONDS_PER_SECOND);
  if (seconds < SECONDS_PER_MINUTE) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  return `${minutes}m ${remainingSeconds}s`;
}

export function CircuitBreakerStatus({
  state,
  className,
}: CircuitBreakerStatusProps) {
  const stateConfig = {
    closed: {
      status: "online" as const,
      label: "Service Available",
      color: "text-green-600",
      description: "All systems operational",
    },
    open: {
      status: "offline" as const,
      label: "Service Unavailable",
      color: "text-red-600",
      description:
        "Service is temporarily unavailable due to repeated failures",
    },
    halfOpen: {
      status: "degraded" as const,
      label: "Testing Service",
      color: "text-amber-600",
      description: "Testing if service has recovered",
    },
  };

  const config = stateConfig[state.current];

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
            {state.current === "open" && (state.recoveryTime ?? 0) > 0 && (
              <div className="text-sm text-muted-foreground text-right">
                <div>Recovery in</div>
                <div className="font-mono">
                  {formatTime((state.recoveryTime ?? 0) - Date.now())}
                </div>
              </div>
            )}

            {state.current === "halfOpen" && (
              <div className="flex items-center gap-2">
                <Spinner
                  variant="ellipsis"
                  size={16}
                  className="text-amber-500"
                />
                <span className="text-xs text-muted-foreground">
                  Testing...
                </span>
              </div>
            )}
          </div>
        </div>
      </Status>
    </div>
  );
}
