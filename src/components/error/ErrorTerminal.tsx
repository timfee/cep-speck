"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ErrorDetails } from "@/lib/error/types";

interface ErrorTerminalProps {
  error: ErrorDetails;
  context?: {
    phase?: string;
    attempt?: number;
    maxAttempts?: number;
  };
  className?: string;
}

interface AnimatedSpanProps {
  children: React.ReactNode;
  delay: number;
}

function AnimatedSpan({ children, delay }: AnimatedSpanProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.3 }}
      className="font-mono text-sm"
    >
      {children}
    </motion.div>
  );
}

export function ErrorTerminal({ error, context, className }: ErrorTerminalProps) {
  const isRecoverable = error.code !== 'UNEXPECTED_ERROR' && error.code !== 'MISSING_API_KEY';

  return (
    <div className={cn(
      "bg-gray-900 rounded-lg border border-red-500/30 shadow-lg overflow-hidden",
      className
    )}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <span className="text-sm text-gray-300 ml-2">Error Console</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-red-400 rounded-full" />
          <span>Error</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 space-y-2 min-h-[120px] max-h-[300px] overflow-auto">
        <AnimatedSpan delay={0}>
          <span className="text-red-400">ERROR</span>{" "}
          <span className="text-gray-300">PRD Generation Failed</span>
        </AnimatedSpan>
        
        <AnimatedSpan delay={100}>
          <span className="text-yellow-400">Code:</span>{" "}
          <span className="text-white">{error.code}</span>
        </AnimatedSpan>
        
        <AnimatedSpan delay={200}>
          <span className="text-yellow-400">Message:</span>{" "}
          <span className="text-gray-300">{error.message}</span>
        </AnimatedSpan>
        
        {context?.phase && (
          <AnimatedSpan delay={300}>
            <span className="text-yellow-400">Phase:</span>{" "}
            <span className="text-white">{context.phase}</span>
          </AnimatedSpan>
        )}
        
        {context?.attempt && context?.maxAttempts && (
          <AnimatedSpan delay={400}>
            <span className="text-yellow-400">Attempt:</span>{" "}
            <span className="text-white">{context.attempt}/{context.maxAttempts}</span>
          </AnimatedSpan>
        )}
        
        <AnimatedSpan delay={500}>
          <span className="text-yellow-400">Timestamp:</span>{" "}
          <span className="text-gray-300">{new Date(error.timestamp).toISOString()}</span>
        </AnimatedSpan>
        
        {isRecoverable && (
          <AnimatedSpan delay={600}>
            <span className="text-green-400">Recovery:</span>{" "}
            <span className="text-white">Available</span>
          </AnimatedSpan>
        )}
        
        {!isRecoverable && (
          <AnimatedSpan delay={600}>
            <span className="text-red-400">Recovery:</span>{" "}
            <span className="text-gray-300">Manual intervention required</span>
          </AnimatedSpan>
        )}

        {error.stack && (
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

        <AnimatedSpan delay={900}>
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-700">
            <span className="text-gray-500">$</span>
            <span className="text-gray-500 animate-pulse">_</span>
          </div>
        </AnimatedSpan>
      </div>
    </div>
  );
}