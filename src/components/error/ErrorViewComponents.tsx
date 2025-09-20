import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import type { ErrorSeverityLevels } from "@/lib/error/types";

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
          <div>
            <strong>Context:</strong>
          </div>
          <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto whitespace-pre-wrap">
            {JSON.stringify(errorLevels.technical.context, null, 2)}
          </pre>
          {(errorLevels.technical.stack ?? "").length > 0 && (
            <>
              <div>
                <strong>Stack Trace:</strong>
              </div>
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto whitespace-pre-wrap">
                {errorLevels.technical.stack}
              </pre>
            </>
          )}
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
          <div>
            <strong>Reproduction Steps:</strong>
            <ol className="mt-1 ml-4 list-decimal space-y-1">
              {errorLevels.support.reproduction.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <strong>Environment:</strong>
            <div className="mt-1 p-2 bg-muted rounded text-xs">
              <div>Browser: {errorLevels.support.environment.userAgent}</div>
              <div>URL: {errorLevels.support.environment.url}</div>
              <div>Time: {errorLevels.support.environment.timestamp}</div>
              <div>
                API Key Present:{" "}
                {errorLevels.support.environment.apiKeyPresent ? "Yes" : "No"}
              </div>
            </div>
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
