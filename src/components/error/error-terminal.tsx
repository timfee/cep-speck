"use client";

import React from "react";

import type { ErrorDetails } from "@/lib/error/types";
import { cn } from "@/lib/utils";

import {
  formatErrorTimestamp,
  hasValidAttemptInfo,
  isErrorRecoverable,
} from "./error-recovery-utils";

import {
  AnimatedSpan,
  ConditionalTerminalLine,
  TerminalLine,
  TerminalPrompt,
} from "./terminal-components";

interface ErrorTerminalProps {
  error: ErrorDetails;
  context?: {
    phase?: string;
    attempt?: number;
    maxAttempts?: number;
  };
  className?: string;
}

export function ErrorTerminal({
  error,
  context,
  className,
}: ErrorTerminalProps) {
  const recoverable = isErrorRecoverable(error);

  return (
    <div
      className={cn(
        "bg-gray-900 rounded-lg border border-red-500/30 shadow-lg overflow-hidden",
        className
      )}
    >
      <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-red-400 font-mono text-sm">Error Terminal</span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <TerminalLine
          label="Code"
          value={error.code}
          delay={100}
          valueColor="text-red-400"
        />

        <TerminalLine
          label="Message"
          value={error.message}
          delay={200}
        />

        <ConditionalTerminalLine
          condition={(context?.phase ?? "").length > 0}
          label="Phase"
          value={context?.phase ?? ""}
          delay={300}
          valueColor="text-white"
        />

        <ConditionalTerminalLine
          condition={hasValidAttemptInfo(context)}
          label="Attempt"
          value={`${context?.attempt}/${context?.maxAttempts}`}
          delay={400}
          valueColor="text-white"
        />

        <TerminalLine
          label="Timestamp"
          value={formatErrorTimestamp(error.timestamp)}
          delay={500}
        />

        <TerminalLine
          label="Recovery"
          value={recoverable ? "Available" : "Manual intervention required"}
          delay={600}
          valueColor={recoverable ? "text-green-400" : "text-red-400"}
        />

        {(error.stack ?? "").length > 0 && (
          <>
            <AnimatedSpan delay={700}>
              <span className="text-yellow-400">Stack:</span>
            </AnimatedSpan>
            <AnimatedSpan delay={800}>
              <pre className="text-xs text-gray-400 whitespace-pre-wrap mt-2 pl-4 border-l border-gray-600">
                {error.stack}
              </pre>
            </AnimatedSpan>
          </>
        )}

        <TerminalPrompt delay={900} />
      </div>
    </div>
  );
}