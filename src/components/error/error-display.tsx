"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status";
import { classifyError } from "@/lib/error/classification";
import type { ErrorDetails } from "@/lib/error/types";

import {
  SupportView,
  TechnicalView,
  ViewLevelTabs,
} from "./error-view-components";
import { buildErrorLevels, buildSupportData } from "./error-level-helpers";
import { ERROR_SEVERITY_STYLES, getRecoveryActions } from "./recovery-helpers";

interface ErrorDisplayProps {
  error: ErrorDetails;
  onRetry?: () => void;
  onConfigureApi?: () => void;
}

export function ErrorDisplay({
  error,
  onRetry,
  onConfigureApi,
}: ErrorDisplayProps) {
  const [viewLevel, setViewLevel] = useState<"user" | "technical" | "support">(
    "user"
  );

  const classification = classifyError({
    message: error.message,
    code: error.code,
  });
  const severityStyle = ERROR_SEVERITY_STYLES[classification.severity];

  // Build error details for progressive disclosure
  const errorLevels = buildErrorLevels(error, severityStyle.icon);

  // Override user level with classification details
  errorLevels.user.title = classification.title;
  errorLevels.user.message = classification.message;

  const recoveryActions = getRecoveryActions(error, onRetry, onConfigureApi);
  const supportData = buildSupportData(error, errorLevels.technical.context);

  return (
    <div className="space-y-4">
      {/* Primary Error Display */}
      <Status status={classification.status} className="border-l-4">
        <StatusIndicator />
        <div className="flex-1 ml-3">
          <StatusLabel>{classification.title}</StatusLabel>
          <p className="text-sm text-muted-foreground mt-1">
            {classification.message}
          </p>
          {(error.attempt ?? 0) > 0 && (error.maxAttempts ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Attempt {error.attempt} of {error.maxAttempts}
            </p>
          )}
        </div>
      </Status>

      {/* Recovery Actions */}
      {recoveryActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recoveryActions.map((action) => (
            <Button
              key={action.id}
              variant={action.primary ? "default" : "outline"}
              size="sm"
              onClick={action.handler}
              className="flex items-center gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Progressive Disclosure Tabs */}
      <ViewLevelTabs viewLevel={viewLevel} onViewLevelChange={setViewLevel} />

      {/* Technical Details */}
      {viewLevel === "technical" && <TechnicalView errorLevels={errorLevels} />}

      {/* Support Information */}
      {viewLevel === "support" && (
        <SupportView errorLevels={errorLevels} supportData={supportData} />
      )}
    </div>
  );
}
