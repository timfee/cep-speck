"use client";

import { SpinnerDots, SpinnerBars, SpinnerSVG } from "./spinner-components";

export interface SpinnerProps {
  variant?: "default" | "ring" | "ellipsis" | "bars" | "infinite";
  size?: number;
  className?: string;
}

export function Spinner({
  variant = "default",
  size = 16,
  className,
}: SpinnerProps) {
  if (variant === "ellipsis")
    return <SpinnerDots size={size} className={className} />;
  if (variant === "bars")
    return <SpinnerBars size={size} className={className} />;
  return <SpinnerSVG variant={variant} size={size} className={className} />;
}
