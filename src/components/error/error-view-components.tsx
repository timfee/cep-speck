import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import type { ErrorSeverityLevels } from "@/lib/error/types";

import { TechnicalContext, StackTrace, ReproductionSteps } from "./error-view-helpers";

interface TechnicalViewProps {
  errorLevels: ErrorSeverityLevels;
}

export function TechnicalView({ errorLevels }: TechnicalViewProps) {
  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Technical Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Code:</strong> {errorLevels.technical.code}
          </div>
          <TechnicalContext context={errorLevels.technical.context} />
          <StackTrace stack={errorLevels.technical.stack} />
        </div>
      </CardContent>
    </Card>
  );
}

interface SupportViewProps {
  errorLevels: ErrorSeverityLevels;
  supportData: string;
}

export function SupportView({ errorLevels, supportData }: SupportViewProps) {
  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Support Information</CardTitle>
          <CopyButton
            text={supportData}
            className="h-8"
            onCopy={() => {
              // User feedback is provided by the CopyButton component itself
              // which changes text to "Copied!" temporarily
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Report ID:</strong> {errorLevels.support.reportId}
          </div>
          <ReproductionSteps steps={errorLevels.support.reproduction} />
          <div>
            <strong>System Information:</strong>
            <ul className="mt-1 ml-4 list-disc space-y-1">
              <li>Browser: {errorLevels.support.environment.userAgent}</li>
              <li>URL: {errorLevels.support.environment.url}</li>
              <li>Timestamp: {errorLevels.support.environment.timestamp}</li>
              <li>API Key Present: {errorLevels.support.environment.apiKeyPresent ? "Yes" : "No"}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ViewLevelTabsProps {
  viewLevel: "user" | "technical" | "support";
  onViewLevelChange: (level: "user" | "technical" | "support") => void;
}

export function ViewLevelTabs({
  viewLevel,
  onViewLevelChange,
}: ViewLevelTabsProps) {
  return (
    <div className="flex gap-2">
      {(["user", "technical", "support"] as const).map((level) => (
        <Button
          key={level}
          variant={viewLevel === level ? "default" : "outline"}
          size="sm"
          onClick={() => onViewLevelChange(level)}
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </Button>
      ))}
    </div>
  );
}
