"use client";

import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusProps {
  status:
    | "valid"
    | "invalid"
    | "warning"
    | "checking"
    | "online"
    | "offline"
    | "degraded"
    | "maintenance";
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Status({ status, message, className, children }: StatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "valid":
      case "online":
        return {
          icon: CheckCircle,
          variant: "default" as const,
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200",
        };
      case "invalid":
      case "offline":
        return {
          icon: XCircle,
          variant: "destructive" as const,
          color: "text-red-600",
          bgColor: "bg-red-50 border-red-200",
        };
      case "warning":
      case "degraded":
        return {
          icon: AlertCircle,
          variant: "secondary" as const,
          color: "text-amber-600",
          bgColor: "bg-amber-50 border-amber-200",
        };
      case "checking":
      case "maintenance":
        return {
          icon: Clock,
          variant: "outline" as const,
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-200",
        };
    }
  };

  const { icon: Icon, variant, color, bgColor } = getStatusConfig();

  if (children) {
    return (
      <div className={cn("rounded-lg border p-3", bgColor, className)}>
        {children}
      </div>
    );
  }

  return (
    <Badge
      variant={variant}
      className={cn("flex items-center gap-2", className)}
    >
      <Icon className={cn("h-4 w-4", color)} />
      {message}
    </Badge>
  );
}

/**
 * StatusIndicator component for use within Status containers
 */
export function StatusIndicator({ className }: { className?: string }) {
  return <div className={cn("w-3 h-3 rounded-full bg-current", className)} />;
}

/**
 * StatusLabel component for use within Status containers
 */
export function StatusLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("text-sm font-medium", className)}>{children}</span>
  );
}
