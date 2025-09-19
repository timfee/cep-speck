/**
 * Enhanced error handling types for comprehensive error management
 */

import type { LucideIcon } from "lucide-react";

export type ErrorSeverity = "critical" | "warning" | "info";
export type ErrorCode =
  | "MISSING_API_KEY"
  | "NETWORK_TIMEOUT"
  | "RATE_LIMITED"
  | "VALIDATION_FAILED"
  | "UNEXPECTED_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "INVALID_INPUT";

export interface ErrorClassification {
  code: ErrorCode;
  severity: ErrorSeverity;
  title: string;
  message: string;
  recoverable: boolean;
  actions: string[];
  status: "offline" | "degraded";
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  timestamp: number;
  phase?: string;
  attempt?: number;
  maxAttempts?: number;
  context?: Record<string, unknown>;
  stack?: string;
  details?: unknown;
}

export interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  primary: boolean;
  handler: () => Promise<void> | void;
}

export interface ErrorSeverityLevels {
  user: {
    title: string;
    message: string;
    icon: LucideIcon;
  };
  technical: {
    code: string;
    stack?: string;
    context: Record<string, unknown>;
  };
  support: {
    reportId: string;
    reproduction: string[];
    environment: EnvironmentInfo;
  };
}

export interface EnvironmentInfo {
  userAgent: string;
  timestamp: string;
  url: string;
  buildVersion?: string;
  apiKeyPresent: boolean;
}

export interface CircuitBreakerState {
  current: "closed" | "open" | "halfOpen";
  failureCount: number;
  lastFailureTime?: number;
  recoveryTime?: number;
}
