"use client";

import { Check, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StepIndicator({
  stepNumber,
  isCompleted,
  isActive,
  showSpinner,
}: {
  stepNumber: number;
  isCompleted: boolean;
  isActive: boolean;
  showSpinner: boolean;
}) {
  const indicatorClass = cn(
    "flex h-8 w-8 items-center justify-center rounded-full",
    "transition-all duration-200",
    isCompleted && "bg-green-500 text-white",
    isActive && "bg-primary text-primary-foreground",
    !isCompleted && !isActive && "bg-gray-200 text-gray-500"
  );

  let indicator: ReactNode = (
    <span className="text-sm font-medium">{stepNumber}</span>
  );
  if (isCompleted) {
    indicator = <Check className="h-4 w-4" />;
  } else if (showSpinner) {
    indicator = <Loader2 className="h-4 w-4 animate-spin" />;
  }

  return (
    <div className="relative flex h-8 w-8 items-center justify-center">
      <div className={indicatorClass}>{indicator}</div>
    </div>
  );
}

export function PhaseBadges({
  details,
}: {
  details?: { label?: string; attempts?: number; issues: number };
}) {
  if (details === undefined) {
    return null;
  }

  const badges: ReactNode[] = [];
  if (typeof details.label === "string" && details.label.length > 0) {
    badges.push(
      <span key="label" className="rounded-full bg-primary/10 px-2 py-1">
        {details.label}
      </span>
    );
  }
  if (typeof details.attempts === "number") {
    badges.push(
      <span key="attempt" className="rounded-full bg-primary/10 px-2 py-1">
        Attempt {details.attempts}
      </span>
    );
  }
  if (details.issues > 0) {
    badges.push(
      <span
        key="issues"
        className="rounded-full bg-destructive/10 px-2 py-1 text-destructive"
      >
        {details.issues} issue{details.issues === 1 ? "" : "s"} detected
      </span>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2 text-xs text-primary">
      {badges}
    </div>
  );
}
