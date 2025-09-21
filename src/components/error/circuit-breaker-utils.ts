/**
 * Circuit breaker status utilities
 */

import type { CircuitBreakerState } from "@/lib/error/types";

// Time formatting utilities
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

/**
 * Format milliseconds into human-readable time
 */
export function formatTime(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / MILLISECONDS_PER_SECOND);
  if (seconds < SECONDS_PER_MINUTE) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Calculate remaining recovery time
 */
export function getRemainingRecoveryTime(state: CircuitBreakerState): number {
  if (state.current !== "open" || !state.recoveryTime) {
    return 0;
  }
  return Math.max(0, state.recoveryTime - Date.now());
}

/**
 * Check if recovery countdown should be shown
 */
export function shouldShowRecoveryTime(state: CircuitBreakerState): boolean {
  return state.current === "open" && state.recoveryTime != null && getRemainingRecoveryTime(state) > 0;
}

/**
 * State configuration mapping
 */
export const STATE_CONFIG = {
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
    description: "Service is temporarily unavailable due to repeated failures",
  },
  halfOpen: {
    status: "degraded" as const,
    label: "Testing Service",
    color: "text-amber-600",
    description: "Testing if service has recovered",
  },
} as const;