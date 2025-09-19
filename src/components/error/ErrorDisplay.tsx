"use client";

import { AlertTriangle, AlertCircle, Info, Settings, RefreshCw, Clock } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status";
// Import existing timeout constants
import { TIMEOUTS } from "@/lib/constants";

import { formatErrorForSupport, ERROR_CLASSIFICATIONS } from "@/lib/error/classification";

import type { ErrorDetails, ErrorSeverityLevels } from "@/lib/error/types";

interface ErrorDisplayProps {
  error: ErrorDetails;
  onRetry?: () => void;
  onConfigureApi?: () => void;
}

const ERROR_SEVERITY_STYLES = {
  critical: {
    border: 'border-red-500',
    background: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-300',
    icon: AlertTriangle
  },
  warning: {
    border: 'border-amber-500', 
    background: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-300',
    icon: AlertCircle
  },
  info: {
    border: 'border-blue-500',
    background: 'bg-blue-50 dark:bg-blue-950/20', 
    text: 'text-blue-700 dark:text-blue-300',
    icon: Info
  }
} as const;

export function ErrorDisplay({ error, onRetry, onConfigureApi }: ErrorDisplayProps) {
  const [viewLevel, setViewLevel] = useState<'user' | 'technical' | 'support'>('user');
  
  const classification = ERROR_CLASSIFICATIONS[error.code];
  const severityStyle = ERROR_SEVERITY_STYLES[classification.severity];
  
  // Build error details for progressive disclosure
  const errorLevels: ErrorSeverityLevels = {
    user: {
      title: classification.title,
      message: classification.message,
      icon: severityStyle.icon
    },
    technical: {
      code: error.code,
      stack: error.stack,
      context: {
        phase: error.phase,
        attempt: error.attempt,
        maxAttempts: error.maxAttempts,
        timestamp: new Date(error.timestamp).toISOString(),
        ...error.context
      }
    },
    support: {
      reportId: `ERR-${Date.now().toString(36).toUpperCase()}`,
      reproduction: [
        "1. Navigate to the PRD generation page",
        "2. Enter specification text",
        "3. Click 'Run' button",
        `4. Error occurred during ${error.phase ?? 'unknown'} phase`
      ],
      environment: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        apiKeyPresent: !error.code.includes('MISSING_API_KEY')
      }
    }
  };

  const getRecoveryActions = () => {
    const actions = [];
    
    switch (error.code) {
      case 'MISSING_API_KEY':
        if (onConfigureApi) {
          actions.push({
            id: 'configure-api',
            label: 'Configure API Key',
            description: 'Add your Google Generative AI API key',
            icon: Settings,
            primary: true,
            handler: onConfigureApi
          });
        }
        break;
      case 'NETWORK_TIMEOUT':
      case 'SERVICE_UNAVAILABLE':
        if (onRetry) {
          actions.push({
            id: 'retry-now',
            label: 'Retry Now',
            description: 'Attempt the operation again',
            icon: RefreshCw,
            primary: true,
            handler: onRetry
          });
        }
        break;
      case 'RATE_LIMITED':
        if (onRetry) {
          actions.push({
            id: 'wait-and-retry',
            label: 'Wait & Retry',
            description: 'Automatically retry after delay',
            icon: Clock,
            primary: true,
            handler: () => {
              setTimeout(() => onRetry(), TIMEOUTS.MEDIUM_DELAY);
            }
          });
        }
        break;
      case 'VALIDATION_FAILED':
        // No specific recovery actions for validation failures
        break;
      case 'UNEXPECTED_ERROR':
        if (onRetry) {
          actions.push({
            id: 'retry-operation',
            label: 'Try Again',
            description: 'Retry the failed operation',
            icon: RefreshCw,
            primary: true,
            handler: onRetry
          });
        }
        break;
      case 'INVALID_INPUT':
        // User needs to correct their input - no automatic recovery
        break;
    }
    
    return actions;
  };

  const recoveryActions = getRecoveryActions();

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
          {error.attempt && error.maxAttempts && (
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
              variant={action.primary ? 'default' : 'outline'}
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
      <div className="flex gap-2">
        {(['user', 'technical', 'support'] as const).map((level) => (
          <Button
            key={level}
            variant={viewLevel === level ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewLevel(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Button>
        ))}
      </div>

      {/* Technical Details */}
      {viewLevel === 'technical' && (
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Technical Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Code:</strong> {errorLevels.technical.code}</div>
              <div><strong>Context:</strong></div>
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(errorLevels.technical.context, null, 2)}
              </pre>
              {errorLevels.technical.stack && (
                <>
                  <div><strong>Stack Trace:</strong></div>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto whitespace-pre-wrap">
                    {errorLevels.technical.stack}
                  </pre>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support Information */}
      {viewLevel === 'support' && (
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Support Information</CardTitle>
              <CopyButton
                text={formatErrorForSupport({
                  code: error.code,
                  message: error.message,
                  timestamp: error.timestamp,
                  context: errorLevels.technical.context,
                  stack: error.stack
                })}
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
                  <div>API Key Present: {errorLevels.support.environment.apiKeyPresent ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}